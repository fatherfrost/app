var express = require('express');
var router = express.Router();
var config = require('./config'); 
var User = require('./app/models/user');
var error = require('./errors');

function sendSubscriptionToBackEnd(subscription) {
    return fetch('/save-subscription/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    })
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Bad status code from server.');
      }
  
      return response.json();
    })
    .then(function(responseData) {
      if (!(responseData.data && responseData.data.success)) {
        throw new Error('Bad response from server.');
      }
    });
  }