/**
 * Copyright (c) 2002-2016 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _resultSummary = require('./result-summary');

// Ensure Promise is available

var _externalEs6Promise = require('../external/es6-promise');

(0, _externalEs6Promise.polyfill)();

/**
  * A Result instance is used for retrieving request response.
  * @access public
  */

var Result = (function () {
  /**
   * Inject the observer to be used.
   * @constructor
   * @param {StreamObserver} streamObserver
   */

  function Result(streamObserver, statement, parameters) {
    _classCallCheck(this, Result);

    this._streamObserver = streamObserver;
    this._p = null;
    this._statement = statement;
    this._parameters = parameters;
  }

  /**
   * Create and return new Promise
   * @return {Promise} new Promise.
   */

  _createClass(Result, [{
    key: '_createPromise',
    value: function _createPromise() {
      if (this._p) {
        return;
      }
      var self = this;
      this._p = new Promise(function (resolve, reject) {
        var records = [];
        var observer = {
          onNext: function onNext(record) {
            records.push(record);
          },
          onCompleted: function onCompleted(summary) {
            records.summary = summary;
            resolve(records);
          },
          onError: function onError(error) {
            reject(error);
          }
        };
        self.subscribe(observer);
      });
    }

    /**
     * Waits for all results and calls the passed in function
     * with the results.
     * Cannot be used with the subscribe function.
     * @param {function(results: Object)} cb - Function to be called when all results are collected.
     * @return {Promise} promise.
     */
  }, {
    key: 'then',
    value: function then(onFulfilled, onRejected) {
      this._createPromise();
      this._p.then(onFulfilled, onRejected);
      return this._p;
    }

    /**
     * Catch errors when using promises.
     * Cannot be used with the subscribe function.
     * @param {function(error: Object)} cb - Function to be called upon errors.
     * @return {Promise} promise.
     */
  }, {
    key: 'catch',
    value: function _catch(onRejected) {
      this._createPromise();
      this._p['catch'](onRejected);
      return this._p;
    }

    /**
     * Stream results to observer as they come in.
     * @param {Object} observer - Observer object
     * @param {function(record: Object)} observer.onNext - Handle records, one by one.
     * @param {function(metadata: Object)} observer.onComplete - Handle stream tail, the metadata.
     * @param {function(error: Object)} observer.onError - Handle errors.
     * @return
     */
  }, {
    key: 'subscribe',
    value: function subscribe(observer) {
      var _this = this;

      var onCompletedOriginal = observer.onCompleted;
      var onCompletedWrapper = function onCompletedWrapper(metadata) {
        var sum = new _resultSummary.ResultSummary(_this._statement, _this._parameters, metadata);
        onCompletedOriginal.call(observer, sum);
      };
      observer.onCompleted = onCompletedWrapper;
      this._streamObserver.subscribe(observer);
    }
  }]);

  return Result;
})();

exports['default'] = Result;
module.exports = exports['default'];