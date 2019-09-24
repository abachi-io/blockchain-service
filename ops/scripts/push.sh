set -o errexit
set -o pipefail
set -o nounset

DOCKER_REGISTRY=${DOCKER_REGISTRY:-blengineering.azurecr.io/blengineering}
IMAGE_NAME=${DOCKER_REGISTRY}/'luca-blockchain-svc'
REGISTRY=$(echo "$DOCKER_REGISTRY" | cut -d '/' -f 1)
VERSION="${DOCKER_IMAGE_ENV_TAG:-dev}"

BUILDMACHINE_GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD | sed 's/\//-/g')
echo "Building from branch: ${BUILDMACHINE_GIT_BRANCH:-na}"
# assign default if not defined (can only happen if someone has deleted the .git folder or git is not installed)
BUILDMACHINE_GIT_BRANCH=${BUILDMACHINE_GIT_BRANCH:-na}
if [ "$BUILDMACHINE_GIT_BRANCH" == "master" ]; then
  VERSIONED_IMAGE_NAME=${IMAGE_NAME}:${VERSION}
else
  VERSIONED_IMAGE_NAME=${IMAGE_NAME}:${BUILDMACHINE_GIT_BRANCH:-na}-${VERSION}
fi

echo
echo "Logging into $REGISTRY"
# docker login -u "${HUB_USERNAME}" -p "${HUB_PASSWORD}" "${REGISTRY}"
docker login  --username ${ACR_USERNAME}  --password ${ACR_PASSWORD} blengineering.azurecr.io

echo
echo "Pushing Docker Tag: ${VERSIONED_IMAGE_NAME}"
docker push ${VERSIONED_IMAGE_NAME}

# echo
# echo "Pushing Docker Tag: ${IMAGE_NAME}:${VERSION}"
# docker push ${IMAGE_NAME}:${VERSION}