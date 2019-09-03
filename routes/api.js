const express = require('express');
const router = express.Router();

const successResponse = (response, message = "", data = null) => {
  response.status(200).send({
    success: true,
    timestamp: Date.now(),
    message,
    data
  })
}

const errorResponse = (response, message, status = 403) => {
  response.status(status).send({
    success: false,
    timestamp: Date.now(),
    message
  })
}

router.get('/ping', (request, response) => {
  return successResponse(response, 'pong')
})


module.exports = router;
