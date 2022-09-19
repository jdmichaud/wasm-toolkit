#!/usr/bin/env bash

LLVM_BRANCH="release/15.x"
if [ $# -eq 1 ]
then
  LLVM_BRANCH=$1
fi
FOLDER=`echo llvm-project-${LLVM_BRANCH} | tr '/' '_'`

if [[ ! -n "$(which cmake)" && -x "$(which cmake)" ]]
then
  echo "error: cmake must be installed"
  exit 2
fi

echo "building ${LLVM_BRANCH}"
pushd . > /dev/null

# Download llvm repository
git clone https://github.com/llvm/llvm-project.git --branch ${LLVM_BRANCH} --single-branch --depth 1 $FOLDER
mkdir -p ${FOLDER}/build
cd ${FOLDER}/build


# -DLLVM_EXPERIMENTAL_TARGETS_TO_BUILD=WebAssembly \

echo "building clang"
cmake ../llvm -DLLVM_ENABLE_PROJECTS="clang" \
  -DCMAKE_BUILD_TYPE=MinSizeRel \
  -DCMAKE_EXE_LINKER_FLAGS=-static \
  -DLLVM_TARGETS_TO_BUILD=WebAssembly \
  -DTERMINFO_LIB=/usr/lib/x86_64-linux-gnu/libncurses.a \
  -DZLIB_LIBRARY_RELEASE=/usr/lib/x86_64-linux-gnu/libz.a
make -j $(nproc)
# Not sure why but I need to launch is again to generate the links
make

echo "building lld"
cmake ../llvm -DLLVM_ENABLE_PROJECTS="lld" \
  -DCMAKE_BUILD_TYPE=MinSizeRel \
  -DCMAKE_EXE_LINKER_FLAGS=-static \
  -DLLVM_TARGETS_TO_BUILD=WebAssembly \
  -DTERMINFO_LIB=/usr/lib/x86_64-linux-gnu/libncurses.a \
  -DZLIB_LIBRARY_RELEASE=/usr/lib/x86_64-linux-gnu/libz.a
make -j $(nproc)
# Not sure why but I need to launch is again to generate the links
make

# Check executables are properly created and get their full paths
cd bin
CLANG_BIN=$(realpath $(readlink clang))
LLD_BIN=$(realpath lld)
if [ ! -x "$CLANG_BIN" ]
then
  echo "error: clang not found or not executable ($CLANG_BIN)"
  exit 1
fi

if [ ! -x "$LLD_BIN" ]
then
  echo "error: lld not found or not executable ($LDD_BIN)"
  exit 1
fi

# Install the executables in dist
DIST=dist/$(node -e 'console.log(`${process.arch}-${process.platform}`)')
popd > /dev/null
mkdir -p ${DIST}
cp ${CLANG_BIN} ${DIST}/
cp ${LLD_BIN} ${DIST}/
strip ${DIST}/*

echo "done."

