pipeline {
    agent none
    stages {
        stage('Restore and Test') {
            agent {
                docker {
                    image 'node:lts'
                    args '-u root'
                }
            }
            steps {
                sh 'node -v'
                sh 'npm -v'
                sh 'npm install'
                withCredentials([string(credentialsId: 'sila-private-key', variable: 'SILA_PRIVATE_KEY')]) {
                    sh 'npm test'
                }
            }
        }
        stage('Sonar Qube Analysis') {
            agent {
                dockerfile true
            }
            steps {
                withSonarQubeEnv('GekoSonar') {
                    sh 'sonar-scanner'
                }
            }
        }
        stage("Quality Gate") {
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
}