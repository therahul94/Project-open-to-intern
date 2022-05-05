const { default: mongoose } = require('mongoose')
const collegeModel = require('../models/collegeModel')
const internModel = require('../models/internModel')


function isValid(data){
    if(typeof data === undefined || data === null) return false
    if(typeof data === 'string' && data.trim().length === 0) return false
    return true
}

function isValidRequestBody(requestBody){
    return Object.keys(requestBody).length > 0
}

function isValidLink(link){
    return /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi.test(link)
}

const createCollege = async function(req, res){

    try{
        const collegeDetails = req.body

        if( !isValidRequestBody(collegeDetails) ){
            return res.status(400).send({status: false, msg: "All fields are required"})
        }

        const {name, fullName, logoLink, isDeleted} = collegeDetails

        if( !isValid(name) ){
            return res.status(400).send({status: false, msg: "Name is required"})
        }
        
        if( !isValid(fullName) ){
            return res.status(400).send({status: false, msg: "fullName is required"})
        }
        if( !isValid(logoLink) ){
            return res.status(400).send({status: false, msg: "logoLink is required"})
        }

        if( !isValidLink(logoLink) ){
            return res.status(400).send({status: false, msg: "Not a link"})
        }

        if( isDeleted === true || !isValid(isDeleted)  || typeof isDeleted === 'string' && isDeleted.trim().length > 0){
            req.body.isDeleted = false
        }

        const isNamePresent = await collegeModel.findOne( { $or:[{name: name}, {fullName: fullName}, {logoLink: logoLink}] } )
        if(isNamePresent){
            return res.status(400).send({status: false, msg: "College is already Present in DB."})
        }

        const collegeData = await collegeModel.create(collegeDetails)
        return res.status(201).send({status: true, data: collegeData})
    }
    catch (err){
        return res.status(500).send({status: false, msg: err.message})
    }

}

const getInterns = async function(req, res){
    try{
        const collegeName= req.query.collegeName

        if( !isValid(collegeName) ){
            return res.status(400).send({status: false, msg: "please enter the college name"})
        }

        const isCollegePresent = await collegeModel.findOne({name: collegeName})
        if(!isCollegePresent || (isCollegePresent.isDeleted === true)){
            return res.status(400).send({status: false, msg: "No college found"})
        }

        const collegeId = isCollegePresent._id.toString()
        if(!mongoose.isValidObjectId(collegeId)){
            return res.status(400).send({status: false, msg: "Not a valid id"})
        }
        
        const internData = await internModel.find({collegeId :collegeId}).select({name:1, mobile:1, email:1})
        
        const collegeDetails = await collegeModel.findOne({name: collegeName}).select({name:1, fullName:1, logoLink:1, _id:0})

        const internListWithCollege = collegeDetails.toJSON()
        internListWithCollege.interests = internData

        return res.status(200).send({status: true, data: internListWithCollege})


    }
    catch(err){
        return res.status(500).send({status: false, msg: err.message})
    }
}

module.exports = {createCollege, getInterns}