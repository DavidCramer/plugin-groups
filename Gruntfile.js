module.exports = function (grunt) {


    // Project configuration.
    grunt.initConfig({
        pkg     : grunt.file.readJSON( 'package.json' ),
        clean: {
            post_build: [
                'build/'
            ],
            pre_compress: [
                'build/releases'
            ]
        },
        copy: {
            build: {
                options : {
                    mode :true
                },
                src: [
                    '**',
                    '!node_modules/**',
                    '!bin/**',
                    '!src/**',
                    '!js/*.map',
                    '!js/*.css',
                    '!css/*.map',
                    '!releases',
                    '!releases/**',
                    '!.git/**',
                    '!Gruntfile.js',
                    '!package.json',
                    '!package-lock.json',
                    '!.gitignore',
                    '!.gitmodules',
                    '!.gitattributes',
                    '!composer.lock',
                    '!naming-conventions.txt',
                    '!how-to-grunt.md',
                    '!webpack.config.js',
                    '!.travis.yml',
                    '!.scrutinizer.yml',
                    '!phpunit.xml',
                    '!tests/**'
                ],
                dest: 'build/'
            }
        },
        compress: {
            main: {
                options: {
                    mode: 'zip',
                    archive: 'releases/<%= pkg.name %>-<%= pkg.version %>.zip'
                },
                expand: true,
                cwd: 'build/',
                src: [
                    '**/*',
                    '!build/*'
                ]
            }
        },
    });

    //load modules
    grunt.loadNpmTasks( 'grunt-contrib-compress' );
    grunt.loadNpmTasks( 'grunt-contrib-clean' );
    grunt.loadNpmTasks( 'grunt-contrib-copy' );

    //release tasks
    grunt.registerTask( 'default', [  'copy', 'compress' ] );
};
