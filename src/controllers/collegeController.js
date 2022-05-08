const { default: mongoose } = require('mongoose')
const collegeModel = require('../models/collegeModel')
const internModel = require('../models/internModel')


// function isValid(data){
//     if(typeof data === undefined || data === null) return false
//     if(typeof data === 'string' && data.trim().length === 0) return false
//     return true
// }

function isValidRequestBody(requestBody){
    return Object.keys(requestBody).length > 0
}

function isValidLink(link){
    if (link.trim().match( /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/ )){
        return true
    }
    return false
}

const createCollege = async function(req, res){

    try{
        const collegeDetails = req.body

        if( !isValidRequestBody(collegeDetails) ){
            return res.status(400).send({status: false, msg: "All fields are required"})
        }

        const {name, fullName, logoLink, isDeleted} = collegeDetails

        if( !name ) { return res.status(400).send({status: false, msg: "Name is required"}) }
        if( !fullName ) { return res.status(400).send({status: false, msg: "fullName is required"}) }
        if( !logoLink ) { return res.status(400).send({status: false, msg: "logoLink is required"}) }

        if( !(name.trim().match(/^[a-zA-Z]+$/)) ){
            return res.status(400).send({status: false, msg: `${name} is INVALID name`})
        }
        if( !(fullName.trim().match(/^[a-zA-Z,\-.\s]*$/)) ){
            return res.status(400).send({status: false, msg: `${fullName} is INVALID fullname`})
        }

        if( !isValidLink(logoLink) ){
            return res.status(400).send({status: false, msg: "Not a link"})
        }

        //Line: 49-54: We are checking if someone doesnot give the isDeleted, it means undefined then bydefalut it will be store as false
        // if isDeleted is empty string then it will show the isDeleted field is empty
        //In line56 (typeof isDeleted !== "boolean") means: isDeleted should not be boolean then only it will show the ERROR, we are doing this because if someone gives the isDeleted: false or true manually then we have to store the value in the DB.

        if( (typeof isDeleted === 'string' && isDeleted.trim().length === 0) || isDeleted === null ){
            return res.status(400).send({status: false, msg: "isDeleted field is empty"})
        }
        if( isDeleted !== undefined && (typeof isDeleted !== "boolean")){ 
            return res.status(400).send({status: false, msg: "Please put correct value"})
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

        if( !collegeName ) { return res.status(400).send({status: false, msg: "please enter the college name"}) }

        if( !( collegeName.trim().match(/^[a-zA-Z]+$/) ) ){
            return res.status(400).send({status: false, msg: `${collegeName} is INVALID collegeName.`})
        }

        const isCollegePresent = await collegeModel.findOne({name: collegeName})
        if(!isCollegePresent || (isCollegePresent.isDeleted === true)){
            return res.status(400).send({status: false, msg:  `${collegeName} college not found`})
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