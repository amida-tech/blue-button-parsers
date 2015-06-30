/*global module*/

var path = require('path');

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    //grunt.loadNpmTasks('grunt-browserify');
    //grunt.loadNpmTasks('grunt-mocha-phantomjs');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-shell');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['*.js', './lib/**/*.js', './test/**/*.js'],
            options: {
                browser: true,
                smarttabs: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: false,
                boss: true,
                eqnull: true,
                node: true,
                expr: true,
                globals: {
                    'it': true,
                    'xit': true,
                    'describe': true,
                    'before': true,
                    'after': true,
                    'done': true
                }
            }
        },
        watch: {
            all: {
                files: ['./lib/*.js', '*.js', './test/*.js'],
                tasks: ['default']
            }
        },
        jsbeautifier: {
            beautify: {
                src: ['Gruntfile.js', 'lib/*.js', 'lib/**/*.js', 'test/*.js', 'test/**/*.js'],
                options: {
                    config: '.jsbeautifyrc'
                }
            },
            check: {
                src: ['Gruntfile.js', 'lib/*.js', 'lib/**/*.js', 'test/*.js', 'test/**/*.js'],
                options: {
                    mode: 'VERIFY_ONLY',
                    config: '.jsbeautifyrc'
                }
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    timeout: '10000',
                    recursive: true
                },
                src: ['test/*.js', 'test/**/*.js']
            }
        },
        coveralls: {
            options: {
                // LCOV coverage file relevant to every target
                src: 'coverage/lcov.info',

                // When true, grunt-coveralls will only print a warning rather than
                // an error, to prevent CI builds from failing unnecessarily (e.g. if
                // coveralls.io is down). Optional, defaults to false.
                force: false
            },
            //your_target: {
            // Target-specific LCOV coverage file
            //src: 'coverage-results/extra-results-*.info'
            //},
        },
        tests: {
            src: ['test/**/*.js'],
            dest: 'dist/mocha_tests.js'
        },
        shell: {
            run_istanbul: {
                command: "istanbul cover ./node_modules/mocha/bin/_mocha -- -R spec --recursive"
            }
        }
    });

    // Default task.
    grunt.registerTask('default', ['beautify', 'jshint', 'mochaTest']);
    //Express omitted for travis build.
    grunt.registerTask('commit', ['jshint', 'mochaTest']);
    grunt.registerTask('mocha', ['mochaTest']);
    grunt.registerTask('timestamp', function () {
        grunt.log.subhead(Date());
    });
    grunt.registerTask('coverage', ['shell:run_istanbul']);

    // Alias the `generator:ccda_samples` task to run `mocha test --recursive --grep generator` instead
    grunt.registerTask('mocha test --recursive', function () {
        var done = this.async();
        require('child_process').exec('mocha test --recursive', function (err, stdout) {
            grunt.log.write(stdout);
            done(err);
        });
    });

    //JS beautifier
    grunt.registerTask('beautify', ['jsbeautifier:beautify']);

};
