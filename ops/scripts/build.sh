set -o errexit
set -o pipefail
set -o nounset

IMAGE_NAME=${DOCKER_REGISTRY:-blengineering.azurecr.io/blengineering}/'luca-blockchain-svc'
echo $IMAGE_NAME
VERSION="${DOCKER_IMAGE_ENV_TAG:-dev}"
BUILD_ENV=${DOCKER_IMAGE_ENV_TAG:-dev}

BUILDMACHINE_GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD | sed 's/\//-/g')
echo "Building from branch: ${BUILDMACHINE_GIT_BRANCH:-na}"
# assign default if not defined (can only happen if someone has deleted the .git folder or git is not installed)
BUILDMACHINE_GIT_BRANCH=${BUILDMACHINE_GIT_BRANCH:-na}
if [ "$BUILDMACHINE_GIT_BRANCH" == "master" ]; then
  VERSIONED_IMAGE_NAME=${IMAGE_NAME}:${VERSION}
else
  VERSIONED_IMAGE_NAME=${IMAGE_NAME}:${BUILDMACHINE_GIT_BRANCH:-na}-${VERSION}
fi

# Build
echo "Build Docker Image: ${VERSIONED_IMAGE_NAME}"
echo "Using pems path from: ${PEMPATH:-'/pems'}"
docker build --build-arg env=${BUILD_ENV:-dev} -t ${IMAGE_NAME} .
echo
echo "Creating Docker Tag: ${VERSIONED_IMAGE_NAME}"
docker tag ${IMAGE_NAME} ${VERSIONED_IMAGE_NAME}