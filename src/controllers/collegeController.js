const collegeModel = require('../models/collegeModel')
const validUrl = require('valid-url')

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

        // if( !isValid(isDeleted) ){
        //     req.body.isDeleted = false           //1
        // }

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

module.exports = {createCollege}