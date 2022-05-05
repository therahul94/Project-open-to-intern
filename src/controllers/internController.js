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

function isValidEmail(email){
    return /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)
}

function isValidMobileNo(mobile){
    return /^([+]\d{2})?\d{10}$/.test(mobile)
}

const createIntern = async function(req, res){

    try{
        const internDetails = req.body
        
        if( !isValidRequestBody(internDetails) ){
            return res.status(400).send({status: false, msg: "All fields are required"})
        }

        const { name, mobile, email, collegeName} = internDetails

        if(!isValid(name)){
            return res.status(400).send({status: false, msg: "name is required"})
        }
        if( !isValid(mobile) ){
            return res.status(400).send({status: false, msg: "mobile is required"})
        }
        
        if( !isValidMobileNo(mobile) ){
            return res.status(400).send({status: false, msg: "Not a Mobile No"})
        }
    
        if( !isValid(email) ){
            return res.status(400).send({status: false, msg: "emailId is required"})
        }
        
        if( !isValidEmail(email) ){
            return res.status(400).send({status: false, msg: "Not a EmailId"})
        }

        if( !isValid(collegeName) ){
            return res.status(400).send({status: false, msg: "College name is required"})
        }


        const isAlreadyIntern = await internModel.findOne({
            $or: [{mobile: mobile}, {email: email}]
        })
        if(isAlreadyIntern){
            return res.status(400).send({status: false, msg: "Cannot add the intern with details."})
        }

        const collegeIdDocument = await collegeModel.findOne({name: collegeName})
        if( !collegeIdDocument ) {
            return res.status(400).send({status: false, msg: "There is no entries with the provided college name."})
        }

        const collegeId = collegeIdDocument._id
        if(!mongoose.isValidObjectId(collegeId)){
            return res.status(400).send({status: false, msg: "Not a valid Object Id"})
        }

        const data = {name, mobile, email, collegeId}

        const addIntern = await internModel.create(data)

        return res.status(201).send({status: true, data: addIntern})
    }
    catch(err){
        return res.status(500).send({status: false, msg: err.message})
    }


}

module.exports = {createIntern}