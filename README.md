# wasm-toolkit

Ensures your environment can compile C/C++ code to freestanding WASM.
Either use the local `clang` installation or provides statically build binaries.

# How to install

```bash
npm install @jdmichaud/wasm-toolkit
```

### Build to wasm

```bash
cat > add.c
extern void *malloc(unsigned long size);

// add.c
int *add (int first, int second)
{
  int *i = malloc(sizeof (int));
  *i = first + second;
  return i;
}
<EOF>
npx clang --target=wasm32 \
  --no-standard-libraries \
  -Wl,--export-all -Wl,--no-entry -Wl,--allow-undefined \
  -o add.wasm add.c
```

### Inspect a WASM file

```bash
npx wasm-objdump -x add.wasm
```

# How to build

You will need:
- `cmake` version 3 or above

```bash
npm run build
```

And hopefully `npm pack` will suffice to package the built tools.

# Contribute

## How to build on linux

You will need a C/C++ compiler (gcc 11 is fine) and cmake (at least version 3).
To build clang, execute:
```bash
./make-clang-linux.sh
```

To build the WASM utilities:
```bash
./make-wabt-linux.sh
```

This should produce the clang/ldd and utilities statically linked binaries in
the appropriate `dist/` folder.

## How to build on windows

You will need a C/C++ compiler (Visual Studio 2019 is fine) and cmake (at least
version 3).

To build clang, execute:
```bash
./make-clang-win.sh
```

To build the WASM utilities:
```bash
./make-wabt-win.sh
```

## Windows VM on linux

Useful documentation here: https://wiki.gentoo.org/wiki/QEMU/Windows_guest

Create a drive:
```bash
qemu-img create -f qcow2 win10.img 30G
```

Download a Windows ISO from microsoft website.

Download the windows drivers ISO image:
```bash
curl -sOL https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/virtio-win.iso
```

Start the VM (replace the ISO name accordingly):
```bash
qemu-system-x86_64 -enable-kvm \
  -cpu host \
  -drive file=win10.img,if=virtio \
  -net nic,model=rtl8139 \
  -net user,hostname=windowsvm \
  -m 16G \
  -monitor stdio \
  -name "Windows" \
  -boot d \
  -drive file=WindowsISO.iso,media=cdrom \
  -drive file=virtio-win-0.X.XXX.iso,media=cdrom
```

You might want to install windows without the `-nic` option first to avoid
creating an online account and enable the option on the first boot.

Once virtdio drivers are install, you can add the options:
```bash
-vga virtio
-smp cores=$(nproc)
```

On windows, you will need build tools to be installed. You can find them
[there](https://visualstudio.microsoft.com/downloads/).

Additionally, you will need [cmake](https://cmake.org/download/) and
[python](https://github.com/winpython/winpython/releases/tag/4.7.20220709final)
(at least 3.9).

