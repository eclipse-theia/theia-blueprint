/**
 * This Jenkinsfile builds Theia across the major OS platforms
 */
import groovy.json.JsonSlurper

distFolder = 'applications/electron/dist'
releaseBranch = 'c'
// Attempt to detect that a PR is Jenkins-related, by looking-for
// the word "jenkins" (case insensitive) in PR branch name and/or
// the PR title
jenkinsRelatedRegex = '(?i).*jenkins.*'

pipeline {
    agent none
    options {
        timeout(time: 5, unit: 'HOURS')
        disableConcurrentBuilds()
    }
    environment {
        BLUEPRINT_JENKINS_CI = 'true'
    }
    stages {
        stage('Build') {
            // only proceed when merging on the release branch or if the
            // PR seems Jenkins-related
            when {
                anyOf {
                    expression {
                        env.JOB_BASE_NAME ==~ /$releaseBranch/
                    }
                    expression {
                        env.CHANGE_BRANCH ==~ /$jenkinsRelatedRegex/
                    }
                    expression {
                        env.CHANGE_TITLE ==~ /$jenkinsRelatedRegex/
                    }
                }
            }
            parallel {
                stage('Create Linux Installer') {
                    agent {
                        kubernetes {
                            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: theia-dev
    image: eclipsetheia/theia-blueprint
    command:
    - cat
    tty: true
    resources:
      limits:
        memory: "8Gi"
        cpu: "2"
      requests:
        memory: "8Gi"
        cpu: "2"
    volumeMounts:
    - name: global-cache
      mountPath: /.cache
    - name: global-yarn
      mountPath: /.yarn
    - name: global-npm
      mountPath: /.npm
    - name: electron-cache
      mountPath: /.electron-gyp
  volumes:
  - name: global-cache
    emptyDir: {}
  - name: global-yarn
    emptyDir: {}
  - name: global-npm
    emptyDir: {}
  - name: electron-cache
    emptyDir: {}
'''
                        }
                    }
                    steps {
                        container('theia-dev') {
                            script {
                                buildInstaller()
                            }
                        }
                        stash includes: "${distFolder}/**/*", name: 'linux'
                    }
                    post {
                        failure {
                            error('Linux installer creation failed, aborting...')
                        }
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
                    post {
                        failure {
                            error('Mac installer creation failed, aborting...')
                        }
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
                    post {
                        failure {
                            error('Windows installer creation failed, aborting...')
                        }
                    }
                }
            }
        }
        stage('Sign and Upload') {
            // only proceed when merging on the release branch or if the
            // PR seems Jenkins-related
            when {
                anyOf {
                    expression {
                        env.JOB_BASE_NAME ==~ /$releaseBranch/
                    }
                    expression {
                        env.CHANGE_BRANCH ==~ /$jenkinsRelatedRegex/
                    }
                    expression {
                        env.CHANGE_TITLE ==~ /$jenkinsRelatedRegex/
                    }
                }
            }
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
                            signInstaller('dmg', 'macsign')
                            notarizeInstaller('dmg')
                            uploadInstaller('macos')
                        }
                    }
                }
                stage('Sign and Upload Windows') {
                    agent {
                        kubernetes {
                            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: theia-dev
    image: eclipsetheia/theia-blueprint
    command:
    - cat
    tty: true
    resources:
      limits:
        memory: "8Gi"
        cpu: "2"
      requests:
        memory: "8Gi"
        cpu: "2"
    volumeMounts:
    - name: global-cache
      mountPath: /.cache
    - name: global-yarn
      mountPath: /.yarn
    - name: global-npm
      mountPath: /.npm
    - name: electron-cache
      mountPath: /.electron-gyp
  - name: jnlp
    volumeMounts:
    - name: volume-known-hosts
      mountPath: /home/jenkins/.ssh
  volumes:
  - name: global-cache
    emptyDir: {}
  - name: global-yarn
    emptyDir: {}
  - name: global-npm
    emptyDir: {}
  - name: electron-cache
    emptyDir: {}
  - name: volume-known-hosts
    configMap:
      name: known-hosts
'''
                        }
                    }
                    steps {
                        unstash 'win'
                        container('theia-dev') {
                            script {
                                signInstaller('exe', 'winsign')
                                updateMetadata('TheiaBlueprint.exe', 'latest.yml')
                            }
                        }
                        container('jnlp') {
                            script {
                                uploadInstaller('windows')
                                copyInstaller('windows', 'TheiaBlueprint', 'exe')
                            }
                        }
                    }
                }
            }
        }
    }
}

def buildInstaller() {
    int MAX_RETRY = 3

    checkout scm
    sh 'printenv && yarn cache dir'
    sh 'yarn cache clean'
    try {
        sh(script: 'yarn --frozen-lockfile --force')
    } catch (error) {
        retry(MAX_RETRY) {
            echo 'yarn failed - Retrying'
            sh(script: 'yarn --frozen-lockfile --force')
        }
    }

    sh "rm -rf ./${distFolder}"
    sshagent(['projects-storage.eclipse.org-bot-ssh']) {
        sh 'yarn electron deploy'
    }
}

def signInstaller(String ext, String url) {
    List installers = findFiles(glob: "${distFolder}/*.${ext}")

    if (installers.size() == 1) {
        sh "curl -o ${distFolder}/signed-${installers[0].name} -F file=@${installers[0].path} http://build.eclipse.org:31338/${url}.php"
        sh "rm ${installers[0].path}"
        sh "mv ${distFolder}/signed-${installers[0].name} ${installers[0].path}"
    } else {
        error("Error during signing: installer not found or multiple installers exist: ${installers.size()}")
    }
}

def notarizeInstaller(String ext) {
    String service = 'http://172.30.206.146:8383/macos-notarization-service'
    List installers = findFiles(glob: "${distFolder}/*.${ext}")

    if (installers.size() == 1) {
        String response = sh(script: "curl -X POST -F file=@${installers[0].path} -F \'options={\"primaryBundleId\": \"eclipse.theia\", \"staple\": true};type=application/json\' ${service}/notarize", returnStdout: true)

        def jsonSlurper = new JsonSlurper()
        def json = jsonSlurper.parseText(response)
        String uuid = json.uuid

        while (json.notarizationStatus.status == 'IN_PROGRESS') {
            sleep(30)
            response = sh(script: "curl ${service}/${uuid}/status", returnStdout: true)
            json = jsonSlurper.parseText(response)
        }

        if (json.notarizationStatus.status != 'COMPLETE') {
            error("Failed to notarize ${installers[0].name}: ${response}")
        }

        sh "curl -o ${distFolder}/stapled-${installers[0].name} ${service}/${uuid}/download"
        sh "rm ${installers[0].path}"
        sh "mv ${distFolder}/stapled-${installers[0].name} ${installers[0].path}"
    } else {
        error("Error during notarization: installer not found or multiple installers exist: ${installers.size()}")
    }
}

def updateMetadata(String executable, String yaml) {
    sh 'yarn install --force'
    sh "yarn electron update:checksum -e ${executable} -y ${yaml}"
}

def uploadInstaller(String platform) {
    if (env.BRANCH_NAME == releaseBranch) {
        def packageJSON = readJSON file: 'package.json'
        String version = "${packageJSON.version}"
        sshagent(['projects-storage.eclipse.org-bot-ssh']) {
            sh "ssh genie.theia@projects-storage.eclipse.org rm -rf /home/data/httpd/download.eclipse.org/theia/c/${version}/${platform}"
            sh "ssh genie.theia@projects-storage.eclipse.org mkdir -p /home/data/httpd/download.eclipse.org/theia/c/${version}/${platform}"
            sh "scp ${distFolder}/*.* genie.theia@projects-storage.eclipse.org:/home/data/httpd/download.eclipse.org/theia/c/${version}/${platform}"
            sh "ssh genie.theia@projects-storage.eclipse.org rm -rf /home/data/httpd/download.eclipse.org/theia/c/latest/${platform}"
            sh "ssh genie.theia@projects-storage.eclipse.org mkdir -p /home/data/httpd/download.eclipse.org/theia/c/latest/${platform}"
            sh "scp ${distFolder}/*.* genie.theia@projects-storage.eclipse.org:/home/data/httpd/download.eclipse.org/theia/c/latest/${platform}"
        }
    } else {
        echo "Skipped upload for branch ${env.BRANCH_NAME}"
    }
}

def copyInstaller(String platform, String installer, String extension) {
    if (env.BRANCH_NAME == releaseBranch) {
        def packageJSON = readJSON file: 'package.json'
        String version = "${packageJSON.version}"
        sshagent(['projects-storage.eclipse.org-bot-ssh']) {
            sh "ssh genie.theia@projects-storage.eclipse.org cp /home/data/httpd/download.eclipse.org/theia/c/latest/${platform}/${installer}.${extension} /home/data/httpd/download.eclipse.org/theia/c/latest/${platform}/${installer}-${version}.${extension}"
        }
    } else {
        echo "Skipped copying installer for branch ${env.BRANCH_NAME}"
    }
}
