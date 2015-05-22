module.exports = function (grunt) {
    grunt.initConfig({
        uglify: {
            dist: {
                files: {
                    'public_html/js/app.min.js': ['js/**/*.js']
                }
            }
        },
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    'public_html/css/app.min.css': ['css/**/*.css']
                }
            }
        },
        watch: {
            js: {
                files: ['js/**/*.*'],
                tasks: ['uglify']
            },
            css: {
                files: ['css/**/*.*'],
                tasks: ['cssmin']
            }
        }
    });
    
    grunt.registerTask('build', ['cssmin', 'uglify']);
    
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
};