#!/usr/bin/env bash

TAG="1.0.29"
if [ $# -eq 1 ]
then
  TAG=$1
fi
FOLDER=`echo wabt-${TAG}`

if [[ ! -n "$(which cmake)" && -x "$(which cmake)" ]]
then
  echo "error: cmake must be installed"
  exit 2
fi

echo "building ${TAG}"
pushd . > /dev/null

# Download llvm repository
git clone https://github.com/WebAssembly/wabt.git --branch ${TAG} --single-branch --depth 1 $FOLDER
cd ${FOLDER}
git submodule update --init
mkdir -p build
cd build

cmake ../ -DBUILD_TESTS=OFF
make -j $(nproc)

popd > /dev/null

DIST=dist/$(node -e 'console.log(`${process.arch}-${process.platform}`)')
cp ${FOLDER}/bin/* ${DIST}/
strip ${DIST}/*

