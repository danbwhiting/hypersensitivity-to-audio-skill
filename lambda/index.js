// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/
// Adapted from the GetWeather template provided by Amazon by Dan Whiting 

// sets up dependencies
const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const languageStrings = require('./languageStrings');


// core functionality for hypersensitivity simulator
const StartSimulation = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        // checks request type
        return request.type === 'LaunchRequest'
            || (request.type === 'IntentRequest'
                && request.intent.name === 'StartSimulation');
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

        // the values above will be inserted into the SSML before it's sent to the APL response
        const ssml = 'Take a moment, relax, and listen. I am going to help you understand how the world appears differently to individuals with hypersensitivity and hyperarousal';
        let audio = 'https://s3.amazonaws.com/DanWhitingBucket/Sensory_mixdown+4.mp3';
        let bgImage = 'https://s3.amazonaws.com/DanWhitingBucket/hypersensitivity+simulation+large.png';
        let fragilex = 'fragilex.org';
        let williams = 'williams-syndrome.org';
        let autism = 'autismspeaks.org';

        // Add APL directive to response
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Create Render Directive
            handlerInput.responseBuilder
                .addDirective({
                    "type": "Alexa.Presentation.APL.RenderDocument",
                    "token": "token",
                    "document": {
                        "type":"Link",
                        "src":  "doc://alexa/apl/documents/hypersensitivity-website"
                    },
                    "datasources": {
                        "myData": {
                            "bgImage": bgImage,
                            "fragilex": fragilex,
                            "williams": williams,
                            "autism": autism
                        }
                    }
                })
        }

       return handlerInput.responseBuilder
            .addDirective({
               "type": "Alexa.Presentation.APLA.RenderDocument",
                "token": "token",
                "document": {
                    "type":"Link",
                    "src":  "doc://alexa/apla/documents/hyperarousal-audio-1"
                },
                "datasources": {
                    "myData": {
                       "ssml": ssml,
                        "audio": audio
                    }
                }
            })
            .getResponse();
    },
};

const HelpHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
            && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        return handlerInput.responseBuilder
            .speak(requestAttributes.t('HELP_MESSAGE'))
            .reprompt(requestAttributes.t('HELP_REPROMPT'))
            .getResponse();
    },
};

const FallbackHandler = {
    // The FallbackIntent can only be sent in those locales which support it,
    // so this handler will always be skipped in locales where it is not supported.
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
            && request.intent.name === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        return handlerInput.responseBuilder
            .speak(requestAttributes.t('FALLBACK_MESSAGE'))
            .reprompt(requestAttributes.t('FALLBACK_REPROMPT'))
            .getResponse();
    },
};

const ExitHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
            && (request.intent.name === 'AMAZON.CancelIntent'
                || request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        return handlerInput.responseBuilder
            .speak(requestAttributes.t('STOP_MESSAGE'))
            .withShouldEndSession(true)
            .getResponse();
    },
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder.getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);
        console.log(`Error stack: ${error.stack}`);
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        return handlerInput.responseBuilder
            .speak(requestAttributes.t('ERROR_MESSAGE'))
            .reprompt(requestAttributes.t('ERROR_MESSAGE'))
            .getResponse();
    },
};


// This request interceptor will log all incoming requests to this lambda
const LoggingRequestInterceptor = {
    process(handlerInput) {
        console.log(`Incoming request: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    }
};

// This response interceptor will log all outgoing responses of this lambda
const LoggingResponseInterceptor = {
    process(handlerInput, response) {
        console.log(`Outgoing response: ${JSON.stringify(response)}`);
    }
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
    .addRequestHandlers(
        StartSimulation,
        HelpHandler,
        ExitHandler,
        FallbackHandler,
        SessionEndedRequestHandler,
    )
    .addRequestInterceptors(
        LoggingRequestInterceptor
    )
    .addResponseInterceptors(
        LoggingResponseInterceptor
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
