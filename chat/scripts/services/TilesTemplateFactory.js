angular.module('TilesTemplateFactory', [])
	.factory('TilesTemplateFactory', function($rootScope, $window, $timeout, socket, User, AppAuth) {
		return {
			init_matrix: function(num_cols, num_rows, leftBehind) {
				this.matrix = [];
				for (col in [0..num_rows]) {
					this.matrix[col] = new Array(num_cols);
				}
				
				if (leftBehind) {
					this.matrix.unshift(new Array(num_cols));
					for (var i = 0; i < (this.matrix[0].length - leftBehind); i++) {
						this.matrix[0][i] = true;
					};
				}
			},
			findPlaceInMatrix: function(width, height, obj) {
				var cell, holes, is_empty, new_row, row, x, y, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _o, _p, _q, _r, _ref, _ref1, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _results, _results1, _results2, _results3, _results4, _s, _x, _y;
				width--;
				height--;
				holes = 0;
				for (y = _i = 0, _len = this.matrix.length; _i < _len; y = ++_i) {
					row = this.matrix[y];
					_ref2 = (function() {
						_results = [];
						for (var _k = 0, _ref1 = row.length; 0 <= _ref1 ? _k <= _ref1 : _k >= _ref1; 0 <= _ref1 ? _k++ : _k--){
							_results.push(_k);
						}
						return _results;
					}).apply(this);
					for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
						x = _ref2[_j];
						cell = row[x];
						if (!cell && (x + width < row.length) && (y + height < this.matrix.length)) {
							is_empty = true;
							if (width > 0 || height > 0) {
								_ref4 = (function() {
									_results1 = [];
									for (var _m = y, _ref3 = y + height; y <= _ref3 ? _m <= _ref3 : _m >= _ref3; y <= _ref3 ? _m++ : _m--){
										_results1.push(_m);
									}
									return _results1;
								}).apply(this);
								for (_l = 0, _len2 = _ref4.length; _l < _len2; _l++) {
									_y = _ref4[_l];
									_ref6 = (function() {
										_results2 = [];
										for (var _o = x, _ref5 = x + width; x <= _ref5 ? _o <= _ref5 : _o >= _ref5; x <= _ref5 ? _o++ : _o--){
											_results2.push(_o);
										}
										return _results2;
									}).apply(this);
									for (_n = 0, _len3 = _ref6.length; _n < _len3; _n++) {
										_x = _ref6[_n];
										if (this.matrix[_y][_x]) {
											is_empty = false;
										} else {
											holes++;
										}
									}
								}
							}
							if (is_empty) {
								_ref8 = (function() {
									_results3 = [];
									for (var _q = y, _ref7 = y + height; y <= _ref7 ? _q <= _ref7 : _q >= _ref7; y <= _ref7 ? _q++ : _q--){
										_results3.push(_q);
									}
									return _results3;
								}).apply(this);
								for (_p = 0, _len4 = _ref8.length; _p < _len4; _p++) {
									_y = _ref8[_p];
									_ref10 = (function() {
										_results4 = [];
										for (var _s = x, _ref9 = x + width; x <= _ref9 ? _s <= _ref9 : _s >= _ref9; x <= _ref9 ? _s++ : _s--){
											_results4.push(_s);
										}
										return _results4;
									}).apply(this);
									for (_r = 0, _len5 = _ref10.length; _r < _len5; _r++) {
										_x = _ref10[_r];
										this.matrix[_y][_x] = obj.id;
									}
								}
								return {
									x: x,
									y: y,
									holes: holes
								};
							}
						}
					}
				}
				if (this.matrix.length >= 100) {
					return;
				}
				this.matrix.push(new_row = new Array(row.length));
				return this.findPlaceInMatrix(width + 1, height + 1, obj);
			},
			leftWidthInMatrix: function() {
				var left = 0;
				for (var x = 0; x < this.matrix.length; x++) {
					for (var y = 0; y < this.matrix[x].length; y++) {
						if (!this.matrix[x][y]) {
							left++;
						}
					}
				}
				return left;
			},
			get: function(numCols, targetTiles, sequence, leftBehind, cellSize) {
				var alternate_video, e, height, idx, left, numRows, place, post, rects, super_near_end, width, _i, _len, _posts, _ref;
				numRows = Math.ceil(targetTiles / numCols);
				rects = [];
				if (numCols > 1) {
					//_posts = _(posts).clone();
					this.init_matrix(numCols, numRows, leftBehind);
					alternate_video = false;
					//_ref = $scope.elements;
					var start = sequence._.array.length - targetTiles;
					_ref = sequence._.array.slice(start, start + targetTiles);
					for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
						post = _ref[idx];
						//console.log('super_near_end', _ref.length, idx, super_near_end = _ref.length - idx < numCols + 1);
						super_near_end = _ref.length - idx < numCols + 1;
						//o_('place.holes', super_near_end, typeof place !== 'undefined' && place !== null ? place.holes : void 0);
						typeof place !== 'undefined' && place !== null ? place.holes : void 0;
						if (!(post.width && post.height)) {
							switch (post.type) {
								case 'video':
									//o_('alternate_video', alternate_video, super_near_end, typeof place !== 'undefined' && place !== null ? place.holes : void 0, !super_near_end && !(typeof place !== 'undefined' && place !== null ? place.holes : void 0));
									typeof place !== 'undefined' && place !== null ? place.holes : void 0;
									!super_near_end && !(typeof place !== 'undefined' && place !== null ? place.holes : void 0);

									if (alternate_video) {
										width = 2;
										height = 1;
									/*} else if (!super_near_end && !((typeof place !== 'undefined' && place !== null ? place.holes : void 0) >= 2)) {
										width = 3;
										height = 2;*/
									} else {
										width = 1;
										height = 1;
									}
									alternate_video = !alternate_video;
									break;
								case 'photo':
									if ((typeof place !== 'undefined' && place !== null ? place.holes : void 0) >= 1 || super_near_end) {
										width = 1;
										height = 1;
									} else {
										width = 2;
										height = 2;
									}
									break;
								default:
									width = 1;
									height = 1;
							}
						} else {
							width = post.width;
							//console.log('width', width);
							if (width === 'full') {
								width = numCols;
								post.height = Math.floor((window.innerHeight-20)/cellSize);
							}
							//console.log('width', width, numCols);
							if (width > numCols) {
								width = numCols;
							}
							height = post.height;
						}
						
						if ((typeof place !== 'undefined' && place !== null ? place.holes : void 0) && idx + 3 >= _ref.length) {
							width = 1;
							height = 1;
						}

						try {
							place = this.findPlaceInMatrix(width, height, post);
							if (place) {
								rects.push(new TilesRectangle(place.x, place.y, width, height));
							}
						} catch (_error) {
							console.log(_error)
							e = _error;
							//o_(e, e.message, e.stack);
							return;
						}
					}

					var left = this.leftWidthInMatrix();
					return [new TilesTemplate(rects, numCols, this.matrix.length > 1 ? (left > 0 ? this.matrix.length-1 : this.matrix.length) : 0), left < 7 ? left : 0];
				} else {
					// create the rects for 1x1 tiles
					for (var y = 0; y < numRows; y++) {
						for (var x = 0; x < numCols; x++) {
							rects.push(new TilesRectangle(x, y, 1, 1));
						}
					}

					return new TilesTemplate(rects, numCols, numRows);
				}
			}
		}
	});