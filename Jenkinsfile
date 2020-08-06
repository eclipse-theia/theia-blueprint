/**
 * This Jenkinsfile builds Theia across the major OS platforms
 */

pipeline {
    agent none
    environment {
        BUILD_TIMEOUT = 180
    }
    stages {
        stage('Build') {
            parallel {
                stage('Create Linux Installer') {
                    agent {
                        kubernetes {
                            label 'node-pod'
                            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: node
    image: thegecko/theia-dev
    command:
    - cat
    tty: true
    resources:
      limits:
        memory: "4Gi"
        cpu: "2"
      requests:
        memory: "4Gi"
        cpu: "2"
    volumeMounts:
    - name: yarn-cache
      mountPath: /.cache
    - name: electron-cache
      mountPath: /.electron-gyp
  volumes:
  - name: yarn-cache
    emptyDir: {}
  - name: electron-cache
    emptyDir: {}
"""
                        }
                    }
                    steps {
                        timeout(time: "${env.BUILD_TIMEOUT}") {
                            container('node') {
                                sh "printenv"
                                sh "yarn cache clean"
                                sh "yarn --frozen-lockfile --force"
                                sh "yarn package"
                            }
                        }
                        stash includes: 'dist/theia*', name: 'linux'
                    }
                }
                stage('Create Mac Installer') {
                    agent {
                        label 'macos'
                    }
                    steps {
                        timeout(time: "${env.BUILD_TIMEOUT}") {
                            sh "printenv"
                            sh "yarn cache clean"
                            sh "yarn --frozen-lockfile --force"
                            sh "yarn package"
                        }
                        stash includes: 'dist/theia*', name: 'mac'
                    }
                }
                stage('Create Windows Installer') {
                    agent {
                        label 'windows'
                    }
                    steps {
                        timeout(time: "${env.BUILD_TIMEOUT}") {
                            bat "set"
                            bat "yarn cache clean"
                            bat "yarn --frozen-lockfile --force"
                            bat "yarn package"
                        }
                        stash includes: 'dist/theia*', name: 'win'
                    }
                }
            }
        }
        stage('Sign and Upload') {
            parallel {
                stage('Upload Linux Installer') {
                    agent any
                    steps {
                        unstash linux
                        sshagent(['projects-storage.eclipse.org-bot-ssh']) {
                            sh '''
                                ssh genie.theia@projects-storage.eclipse.org rm -rf /home/data/httpd/download.eclipse.org/theia/snapshots/linux
                                ssh genie.theia@projects-storage.eclipse.org mkdir -p /home/data/httpd/download.eclipse.org/theia/snapshots/linux
                                scp -r dist/* genie.theia@projects-storage.eclipse.org:/home/data/httpd/download.eclipse.org/theia/snapshots/linux
                            '''
                        }
                    }
                }
                stage('Sign and Upload Mac Installer') {
                    agent any
                    steps {
                        unstash mac
                        timeout(time: "${env.BUILD_TIMEOUT}") {
                            sh "curl -o dist/signed-theia-1.2.0.dmg -F file=@dist/theia-1.2.0.dmg http://build.eclipse.org:31338/macsign.php"
                        }
                        sshagent(['projects-storage.eclipse.org-bot-ssh']) {
                            sh '''
                                ssh genie.theia@projects-storage.eclipse.org rm -rf /home/data/httpd/download.eclipse.org/theia/snapshots/macos
                                ssh genie.theia@projects-storage.eclipse.org mkdir -p /home/data/httpd/download.eclipse.org/theia/snapshots/macos
                                scp -r dist/* genie.theia@projects-storage.eclipse.org:/home/data/httpd/download.eclipse.org/theia/snapshots/macos
                            '''
                        }
                    }
                }
                stage('Sign and Upload Windows Installer') {
                    agent any
                    steps {
                        unstash win
                        timeout(time: "${env.BUILD_TIMEOUT}") {
                            sh "curl -o dist/signed-theia-Installer-1.2.0.exe -F file=@dist/theia-Installer-1.2.0.exe http://build.eclipse.org:31338/winsign.php"
                        }
                        sshagent(['projects-storage.eclipse.org-bot-ssh']) {
                            sh '''
                                ssh genie.theia@projects-storage.eclipse.org rm -rf /home/data/httpd/download.eclipse.org/theia/snapshots/windows
                                ssh genie.theia@projects-storage.eclipse.org mkdir -p /home/data/httpd/download.eclipse.org/theia/snapshots/windows
                                scp -r dist/* genie.theia@projects-storage.eclipse.org:/home/data/httpd/download.eclipse.org/theia/snapshots/windows
                            '''
                        }
                    }
                }
            }
        }
    }
}
