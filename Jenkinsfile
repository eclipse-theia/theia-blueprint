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
        stage('Build and Sign') {
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
        stage('Notarize and Upload') {
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
                stage('Sign and Upload Mac') {
                    agent any
                    steps {
                        unstash 'mac'
                        script {
                            notarizeInstaller()
                            uploadInstaller('macos')
                        }
                    }
                }
                stage('Sign and Upload Windows') {
                    agent any
                    steps {
                        unstash 'win'
                        script {
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
    sshagent(['projects-storage.eclipse.org-bot-ssh']) {
        sh "yarn package"
    }
}

def notarizeInstaller() {
    String service = 'http://172.30.206.146:8383/macos-notarization-service'
    List installers = findFiles(glob: "dist/signed-*.dmg")

    if (installers.size() > 0) {
        String response = sh(script: "curl -X POST -F file=@${installers[0].path} -F \'options={\"primaryBundleId\": \"theia\", \"staple\": true};type=application/json\' ${service}/notarize", returnStdout: true)

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

        sh "curl -o dist/notarized-${installers[0].name} ${service}/${uuid}/download"
    }
}

def uploadInstaller(String platform) {
    def packageJSON = readJSON file: "package.json"
    String version = "${packageJSON.version}"
    sshagent(['projects-storage.eclipse.org-bot-ssh']) {
        sh "ssh genie.theia@projects-storage.eclipse.org rm -rf /home/data/httpd/download.eclipse.org/theia/${version}/${platform}"
        sh "ssh genie.theia@projects-storage.eclipse.org mkdir -p /home/data/httpd/download.eclipse.org/theia/${version}/${platform}"
        sh "scp -r dist/*theia* genie.theia@projects-storage.eclipse.org:/home/data/httpd/download.eclipse.org/theia/${version}/${platform}"
    }
}
