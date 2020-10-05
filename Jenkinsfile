/**
 * This Jenkinsfile builds Theia across the major OS platforms
 */
import groovy.json.JsonSlurper

pipeline {
    agent none
    options {
        timeout(time: 3, unit: 'HOURS') 
    }
    stages {
        stage('Build') {
            parallel {
                stage('Create Linux Installer') {
                    agent {
                        kubernetes {
                            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: theia-dev
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
                        container('theia-dev') {
                            script {
                                buildInstaller()
                            }
                        }
                        stash name: 'linux'
                    }
                }
                stage('Create Mac Installer') {
                    agent {
                        label 'macos'
                    }
                    steps {
                        script {
                            buildInstaller()
                        }
                        stash name: 'mac'
                    }
                }
                stage('Create Windows Installer') {
                    agent {
                        label 'windows'
                    }
                    steps {
                        script {
                            buildInstaller()
                        }
                        stash name: 'win'
                    }
                }
            }
        }
        stage('Sign and Upload') {
            parallel {
                stage('Upload Linux') {
                    agent any
                    steps {
                        unstash 'linux'
                        script {
                            uploadInstaller('linux')
                        }
                    }
                }
                stage('Sign, Notarize and Upload Mac') {
                    agent any
                    steps {
                        unstash 'mac'
                        script {
                            signInstaller('pkg', 'macsign')
                            notarizeInstaller('pkg')
                            uploadInstaller('macos')
                        }
                    }
                }
                stage('Sign and Upload Windows') {
                    agent any
                    steps {
                        unstash 'win'
                        script {
                            signInstaller('exe', 'winsign')
                            uploadInstaller('windows')
                        }
                    }
                }
            }
        }
    }
}

def buildInstaller() {
    checkout scm
    sh "printenv"
    sh "yarn cache clean"
    sh "yarn --frozen-lockfile --force"
    sh "rm -rf ./dist"
    sshagent(['projects-storage.eclipse.org-bot-ssh']) {
        sh "yarn package"
    }
}

def signInstaller(String ext, String url) {
    List installers = findFiles(glob: "dist/*.${ext}")

    if (installers.size() == 1) {
        sh "curl -o dist/signed-${installers[0].name} -F file=@${installers[0].path} http://build.eclipse.org:31338/${url}.php"
        sh "rm ${installers[0].path}"
        sh "mv dist/signed-${installers[0].name} ${installers[0].path}"
    } else {
        error("Error during signing: installer not found or multiple installers exist: ${installers.size()}")
    }
}

def notarizeInstaller(String ext) {
    String service = 'http://172.30.206.146:8383/macos-notarization-service'
    List installers = findFiles(glob: "dist/*.${ext}")

    if (installers.size() == 1) {
        String response = sh(script: "curl -X POST -F file=@${installers[0].path} -F \'options={\"primaryBundleId\": \"eclipse.theia\", \"staple\": true};type=application/json\' ${service}/notarize", returnStdout: true)

        def jsonSlurper = new JsonSlurper()
        def json = jsonSlurper.parseText(response)
        String uuid = json.uuid

        while(json.notarizationStatus.status == 'IN_PROGRESS') {
            sleep(30)
            response = sh(script: "curl ${service}/${uuid}/status", returnStdout: true)
            json = jsonSlurper.parseText(response)
        }

        if (json.notarizationStatus.status != 'COMPLETE') {
            error("Failed to notarize ${installers[0].name}: ${response}")
        }

        sh "curl -o dist/stapled-${installers[0].name} ${service}/${uuid}/download"
        sh "rm ${installers[0].path}"
        sh "mv dist/stapled-${installers[0].name} ${installers[0].path}"
    } else {
        error("Error during notarization: installer not found or multiple installers exist: ${installers.size()}")
    }
}

def uploadInstaller(String platform) {
    def packageJSON = readJSON file: "package.json"
    String version = "${packageJSON.version}"
    sshagent(['projects-storage.eclipse.org-bot-ssh']) {
        sh "ssh genie.theia@projects-storage.eclipse.org rm -rf /home/data/httpd/download.eclipse.org/theia/${version}/${platform}"
        sh "ssh genie.theia@projects-storage.eclipse.org mkdir -p /home/data/httpd/download.eclipse.org/theia/${version}/${platform}"
        sh "scp dist/*.* genie.theia@projects-storage.eclipse.org:/home/data/httpd/download.eclipse.org/theia/${version}/${platform}"
    }
}
