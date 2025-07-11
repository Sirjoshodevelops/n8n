/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Container } from '@n8n/di';
import { spawn } from 'child_process';
import glob from 'fast-glob';
import { copyFile, mkdir, readFile, writeFile } from 'fs/promises';
import { InstanceSettings } from 'n8n-core';
import { jsonParse } from 'n8n-workflow';
import { join, dirname, resolve as resolvePath } from 'path';
import { file as tmpFile } from 'tmp-promise';

import type { IBuildOptions } from './Interfaces';

/**
 * Create a custom tsconfig file as tsc currently has no way to define a base
 * directory:
 * https://github.com/Microsoft/TypeScript/issues/25430
 */

export async function createCustomTsconfig() {
	// Get path to simple tsconfig file which should be used for build
	const tsconfigPath = join(dirname(require.resolve('n8n-node-dev/src')), 'tsconfig-build.json');

	// Read the tsconfig file
	const tsConfigString = await readFile(tsconfigPath, { encoding: 'utf8' });

	const tsConfig = jsonParse<{ include: string[] }>(tsConfigString);

	// Set absolute include paths
	const newIncludeFiles = [];

	for (const includeFile of tsConfig.include) {
		newIncludeFiles.push(join(process.cwd(), includeFile));
	}
	tsConfig.include = newIncludeFiles;

	// Write new custom tsconfig file
	const { path, cleanup } = await tmpFile();
	await writeFile(path, JSON.stringify(tsConfig, null, 2));

	return {
		path,
		cleanup,
	};
}

/**
 * Builds and copies credentials and nodes
 *
 * @param {IBuildOptions} [options] Options to overwrite default behavior
 */
export async function buildFiles({
	destinationFolder = Container.get(InstanceSettings).customExtensionDir,
	watch,
}: IBuildOptions): Promise<string> {
	const tscPath = join(dirname(require.resolve('typescript')), 'tsc');
	const tsconfigData = await createCustomTsconfig();

	await Promise.all(
		['*.svg', '*.png', '*.node.json'].map(async (filenamePattern) => {
			const files = await glob(`**/${filenamePattern}`);
			for (const file of files) {
				const src = resolvePath(process.cwd(), file);
				const dest = resolvePath(destinationFolder, file);
				await mkdir(dirname(dest), { recursive: true });
				await copyFile(src, dest);
			}
		}),
	);

	// Supply a node base path so that it finds n8n-core and n8n-workflow
	const nodeModulesPath = join(__dirname, '../../node_modules/');
	let buildCommand = `${tscPath} --p ${
		tsconfigData.path
	} --outDir ${destinationFolder} --rootDir ${process.cwd()} --baseUrl ${nodeModulesPath}`;
	if (watch) {
		buildCommand += ' --watch';
	}

	try {
		const buildProcess = spawn('node', buildCommand.split(' '), {
			windowsVerbatimArguments: true,
			cwd: process.cwd(),
		});

		// Forward the output of the child process to the main one
		// that the user can see what is happening
		buildProcess.stdout.pipe(process.stdout);
		buildProcess.stderr.pipe(process.stderr);

		// Make sure that the child process gets also always terminated
		// when the main process does
		process.on('exit', () => buildProcess.kill());

		await new Promise<void>((resolve) => {
			buildProcess.on('exit', resolve);
		});
	} catch (error) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		let errorMessage = error.message;

		if (error.stdout !== undefined) {
			errorMessage = `${errorMessage}\nGot following output:\n${error.stdout}`;
		}

		throw new Error(errorMessage);
	} finally {
		// Remove the tmp tsconfig file
		await tsconfigData.cleanup();
	}

	return destinationFolder;
}
