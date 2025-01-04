const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const outDir = path.resolve(__dirname, '../out');
const zipFile = path.resolve(outDir, '../webpage.zip');

(async () => {
    try {
        console.log('Processing files in:', outDir);

        // Renaming .html files to files without extension
        const files = fs.readdirSync(outDir);
        for (const file of files) {
            const filePath = path.join(outDir, file);

            if (fs.statSync(filePath).isFile() && file.endsWith('.html') && file !== 'index.html') {
                const newFilePath = path.join(outDir, file.replace(/\.html$/, ''));
                fs.renameSync(filePath, newFilePath);
                console.log(`Renamed: ${file} -> ${path.basename(newFilePath)}`);
            }
        }

        // Create ZIP archive
        console.log('Creating ZIP archive...');
        const output = fs.createWriteStream(zipFile);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            console.log(`ZIP file created: ${zipFile} (${archive.pointer()} total bytes)`);
        });

        archive.on('error', (err) => {
            throw err;
        });

        archive.pipe(output);
        archive.directory(outDir, false);
        await archive.finalize();

        // Remove `out` directory
        console.log('Cleaning up...');
        fs.rmSync(outDir, { recursive: true, force: true });
        console.log('Done!');
    } catch (err) {
        console.error('Error during post-build process:', err);
        process.exit(1);
    }
})();
