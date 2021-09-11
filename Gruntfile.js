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
        run: {
            tool: {
                cmd: './composer'
            }
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
        gitadd: {
            add_zip: {
                options: {
                    force: true
                },
                files: {
                    src: [ 'releases/<%= pkg.name %>-<%= pkg.version %>.zip' ]
                }
            }
        },
        gittag: {
            addtag: {
                options: {
                    tag: '<%= pkg.version %>',
                    message: 'Version <%= pkg.version %>'
                }
            }
        },
        gitcommit: {
            commit: {
                options: {
                    message: 'Version <%= pkg.version %>',
                    noVerify: true,
                    noStatus: false,
                    allowEmpty: true
                },
                files: {
                    src: [ 'package.json', 'plugin-groups.php', 'plugin-groups.php', 'releases/<%= pkg.name %>-<%= pkg.version %>.zip' ]
                }
            }
        },
        gitpush: {
            push: {
                options: {
                    tags: true,
                    remote: 'origin',
                    branch: 'master'
                }
            }
        },
        replace: {
            core_file: {
                src: [ 'plugin-groups.php' ],
                overwrite: true,
                replacements: [{
                    from: /Version:\s*(.*)/,
                    to: "Version: <%= pkg.version %>"
                }]
            }
        }

    });

    //load modules
    grunt.loadNpmTasks( 'grunt-contrib-compress' );
    grunt.loadNpmTasks( 'grunt-contrib-clean' );
    grunt.loadNpmTasks( 'grunt-contrib-copy' );
    grunt.loadNpmTasks( 'grunt-git' );
    grunt.loadNpmTasks( 'grunt-text-replace' );

    //release tasks
    grunt.registerTask( 'version_number', [ 'replace:core_file' ] );
    grunt.registerTask( 'pre_vcs', [ 'version_number', 'copy', 'compress' ] );
    grunt.registerTask( 'do_git', [ 'gitadd', 'gitcommit', 'gittag', 'gitpush' ] );
    grunt.registerTask( 'just_build', [  'copy', 'compress' ] );

    grunt.registerTask( 'release', [ 'pre_vcs', 'do_git', 'clean:post_build' ] );


};
