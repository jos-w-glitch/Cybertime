# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import collect_all

datas = [('config.txt', '.'), ('DinoRun1.png', '.'), ('DinoRun2.png', '.'), ('DinoJump.png', '.'), ('SmallCactus1.png', '.'), ('SmallCactus2.png', '.'), ('SmallCactus3.png', '.'), ('LargeCactus1.png', '.'), ('LargeCactus3.png', '.'), ('Track.png', '.')]
binaries = []
hiddenimports = ['neat', 'neat.nn', 'neat.nn.feed_forward', 'neat.reporting', 'neat.statistics']
tmp_ret = collect_all('neat')
datas += tmp_ret[0]; binaries += tmp_ret[1]; hiddenimports += tmp_ret[2]
tmp_ret = collect_all('pygame')
datas += tmp_ret[0]; binaries += tmp_ret[1]; hiddenimports += tmp_ret[2]


a = Analysis(
    ['/Users/josephweiss/Documents/coding projects/summer vacation projects/pygame/main.py'],
    pathex=[],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='dino_evolution',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['/Users/josephweiss/Documents/coding projects/summer vacation projects/pygame/DinoRun1.ico'],
)
