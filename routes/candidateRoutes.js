const express = require('express')
const router = express.Router()
const Candidate = require('./../models/candidate');
const User = require('../models/user');
const { isAuthenticated } = require('./../jwt')

const isAdmin = async (userID) => {
    try {
        const user = await User.findById(userID);
        if (user.role === 'admin') {
            return true;
        }
    } catch (err) {
        return false;
    }
}

//add candidate
router.post('/', isAuthenticated, async (req, res) => {
    try {

        if (!(await isAdmin(req.user.id))) {
            return res.status(403).json({
                message: "User doesn't have access."
            })
        }
        const data = req.body;
        const candidateExists = await Candidate.findOne({ adharNumber: data.adharNumber })
        if (candidateExists) {
            return res.status(400).json("Candidate already exist")
        }
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save()
        res.status(200).json({
            message: "Candidate registered",
            response: response
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'Internal server error'
        })
    }
})

//update candidate details
router.put('/:candidateId', isAuthenticated, async (req, res) => {
    try {
        if (!(await isAdmin(req.user.id))) {
            return res.status(403).json({
                message: "User doesn't have access."
            })
        }
        const cId = req.params.candidateId;
        const updatedData = req.body;

        const response = await Candidate.findByIdAndUpdate(cId, updatedData, {
            new: true, //return the updated document
            runValidators: true   //run mongoose validation
        })
        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        res.status(200).json({
            message: "Details Updated",
            response: response
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'Internal server error'
        })
    }
})

//delete candidate
router.delete('/:candidateId', isAuthenticated, async (req, res) => {
    try {
        if (!(await isAdmin(req.user.id))) {
            return res.status(403).json({
                message: "User doesn't have access."
            })
        }

        const cId = req.params.candidateId
        const candidate = await Candidate.findByIdAndDelete(cId)
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        res.status(200).json({
            message: 'Candidate deleted',
            candidate
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'Internal server error'
        })
    }
})

//get list of all candidates.
router.get('/candidates', async (req, res) => {
    try {
        //find all candidates (empty array is used for all candidates)
        //include name and party field and exclude _id field
        const candidates = await Candidate.find({}, 'name party -_id')
        res.status(200).json(candidates);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'Internal server error'
        })
    }

})

//vote candidate
router.post('/:candidateId', isAuthenticated, async (req, res) => {
    //admin can't vote     // user can vote once
    const cId = req.params.candidateId;
    const userId = req.user.id;

    try {
        //find candidate if exists or not
        const candidate = await Candidate.findById(cId);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" })
        }
        //find user exists or not
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Admin is not allowed to vote.' })
        }
        if (user.isVoted) {
            return res.status(400).json({ message: 'You have already voted' })
        }

        candidate.votes.push({ user: userId });     //push the user id to the votes array 
        candidate.voteCount++                    //increment the count of votes  
        await candidate.save();

        //make sure in user document the isVoted field gets updated to true so the user can't vote again.
        user.isVoted = true;
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'Internal server error'
        })
    }
})

router.get('/counts', async (req, res) => {
    try {
        //find all candidates and sort them based on their vote count in decreasing order.
        //const candidates = await Candidate.find().sort({voteCount: 'desc'});

        const candidates = await Candidate.find({} , 'name party voteCount -_id').sort({voteCount:-1})
        return res.status(200).json(candidates);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'Internal server error'
        })
    }
})


module.exports = router;