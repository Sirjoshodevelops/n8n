/**
 * @type {import('@types/eslint').ESLint.ConfigData}
 */
const config = (module.exports = {
	ignorePatterns: [
		'node_modules/**',
		'dist/**',
		'tsup.config.ts',
		// TODO: remove these
		'*.js',
	],

	plugins: [
		/**
		 * Plugin with lint rules for import/export syntax
		 * https://github.com/import-js/eslint-plugin-import
		 */
		'eslint-plugin-import',

		/**
		 * @typescript-eslint/eslint-plugin is required by eslint-config-airbnb-typescript
		 * See step 2: https://github.com/iamturns/eslint-config-airbnb-typescript#2-install-eslint-plugins
		 */
		'@typescript-eslint',

		/*
		 * Plugin to allow specifying local ESLint rules.
		 * https://github.com/ivov/eslint-plugin-n8n-local-rules
		 */
		'eslint-plugin-n8n-local-rules',

		/** https://github.com/sweepline/eslint-plugin-unused-imports */
		'unused-imports',

		/** https://github.com/sindresorhus/eslint-plugin-unicorn */
		'eslint-plugin-unicorn',

		/** https://github.com/wix-incubator/eslint-plugin-lodash */
		'eslint-plugin-lodash',
	],

	extends: [
		/**
		 * Config for typescript-eslint recommended ruleset (without type checking)
		 *
		 * https://github.com/typescript-eslint/typescript-eslint/blob/1c1b572c3000d72cfe665b7afbada0ec415e7855/packages/eslint-plugin/src/configs/recommended.ts
		 */
		'plugin:@typescript-eslint/recommended',

		/**
		 * Config for typescript-eslint recommended ruleset (with type checking)
		 *
		 * https://github.com/typescript-eslint/typescript-eslint/blob/1c1b572c3000d72cfe665b7afbada0ec415e7855/packages/eslint-plugin/src/configs/recommended-requiring-type-checking.ts
		 */
		'plugin:@typescript-eslint/recommended-requiring-type-checking',

		/**
		 * Config for Airbnb style guide for TS, /base to remove React rules
		 *
		 * https://github.com/iamturns/eslint-config-airbnb-typescript
		 * https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb-base/rules
		 */
		'eslint-config-airbnb-typescript/base',

		/**
		 * Config to disable ESLint rules covered by Prettier
		 *
		 * https://github.com/prettier/eslint-config-prettier
		 */
		'eslint-config-prettier',
	],

	rules: {
		// ******************************************************************
		//                     additions to base ruleset
		// ******************************************************************

		// ----------------------------------
		//              ESLint
		// ----------------------------------

		/**
		 * https://eslint.org/docs/rules/id-denylist
		 */
		'id-denylist': [
			'error',
			'err',
			'cb',
			'callback',
			'any',
			'Number',
			'number',
			'String',
			'string',
			'Boolean',
			'boolean',
			'Undefined',
			'undefined',
		],

		/**
		 * https://eslint.org/docs/latest/rules/no-void
		 */
		'no-void': ['error', { allowAsStatement: true }],

		/**
		 * https://eslint.org/docs/latest/rules/indent
		 *
		 * Delegated to Prettier.
		 */
		indent: 'off',

		/**
		 * https://eslint.org/docs/latest/rules/no-constant-binary-expression
		 */
		'no-constant-binary-expression': 'error',

		/**
		 * https://eslint.org/docs/latest/rules/sort-imports
		 */
		'sort-imports': 'off', // @TECH_DEBT: Enable, prefs to be decided - N8N-5821

		// ----------------------------------
		//        @typescript-eslint
		// ----------------------------------

		/**
		 * https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/array-type.md
		 */
		'@typescript-eslint/array-type': ['error', { default: 'array-simple' }],

		/** https://typescript-eslint.io/rules/await-thenable/ */
		'@typescript-eslint/await-thenable': 'error',

		/**
		 * https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/ban-ts-comment.md
		 */
		'@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': true }],

		/**
		 * https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/ban-types.md
		 */
		'@typescript-eslint/ban-types': [
			'error',
			{
				types: {
					Object: {
						message: 'Use object instead',
						fixWith: 'object',
					},
					String: {
						message: 'Use string instead',
						fixWith: 'string',
					},
					Boolean: {
						message: 'Use boolean instead',
						fixWith: 'boolean',
					},
					Number: {
						message: 'Use number instead',
						fixWith: 'number',
					},
					Symbol: {
						message: 'Use symbol instead',
						fixWith: 'symbol',
					},
					Function: {
						message: [
							'The `Function` type accepts any function-like value.',
							'It provides no type safety when calling the function, which can be a common source of bugs.',
							'It also accepts things like class declarations, which will throw at runtime as they will not be called with `new`.',
							'If you are expecting the function to accept certain arguments, you should explicitly define the function shape.',
						].join('\n'),
					},
				},
				extendDefaults: false,
			},
		],

		/**
		 * https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/consistent-type-assertions.md
		 */
		'@typescript-eslint/consistent-type-assertions': 'error',

		/**
		 * https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/consistent-type-imports.md
		 */
		'@typescript-eslint/consistent-type-imports': 'error',

		/**
		 * https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/member-delimiter-style.md
		 */
		'@typescript-eslint/member-delimiter-style': [
			'error',
			{
				multiline: {
					delimiter: 'semi',
					requireLast: true,
				},
				singleline: {
					delimiter: 'semi',
					requireLast: false,
				},
			},
		],

		/**
		 * https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/naming-convention.md
		 */
		'@typescript-eslint/naming-convention': [
			'error',
			{
				selector: 'default',
				format: ['camelCase'],
			},
			{
				selector: 'variable',
				format: ['camelCase', 'snake_case', 'UPPER_CASE', 'PascalCase'],
				leadingUnderscore: 'allowSingleOrDouble',
				trailingUnderscore: 'allowSingleOrDouble',
			},
			{
				selector: 'property',
				format: ['camelCase', 'snake_case', 'UPPER_CASE'],
				leadingUnderscore: 'allowSingleOrDouble',
				trailingUnderscore: 'allowSingleOrDouble',
			},
			{
				selector: 'typeLike',
				format: ['PascalCase'],
			},
			{
				selector: ['method', 'function', 'parameter'],
				format: ['camelCase'],
				leadingUnderscore: 'allowSingleOrDouble',
			},
		],

		/**
		 * https://github.com/import-js/eslint-plugin-import/blob/HEAD/docs/rules/no-duplicates.md
		 */
		'import/no-duplicates': 'error',

		/**
		 * https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-invalid-void-type.md
		 */
		'@typescript-eslint/no-invalid-void-type': 'error',

		/**
		 * https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-misused-promises.md
		 */
		'@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],

		/**
		 * https://github.com/typescript-eslint/typescript-eslint/blob/v4.30.0/packages/eslint-plugin/docs/rules/no-floating-promises.md
		 */
		'@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],

		/**
		 * https://github.com/typescript-eslint/typescript-eslint/blob/v4.33.0/packages/eslint-plugin/docs/rules/no-namespace.md
		 */
		'@typescript-eslint/no-namespace': 'off',

		/**
		 * https://eslint.org/docs/1.0.0/rules/no-throw-literal
		 */
		'@typescript-eslint/no-throw-literal': 'error',

		/**
		 * https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unnecessary-boolean-literal-compare.md
		 */
		'@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',

		/**
		 * https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unnecessary-qualifier.md
		 */
		'@typescript-eslint/no-unnecessary-qualifier': 'error',

		/**
		 * https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unused-expressions.md
		 */
		'@typescript-eslint/no-unused-expressions': 'error',

		/**
		 * https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/prefer-nullish-coalescing.md
		 */
		'@typescript-eslint/prefer-nullish-coalescing': 'error',

		/**
		 * https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/prefer-optional-chain.md
		 */
		'@typescript-eslint/prefer-optional-chain': 'error',

		/**
		 * https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/promise-function-async.md
		 */
		'@typescript-eslint/promise-function-async': 'error',

		/**
		 * https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/triple-slash-reference.md
		 */
		'@typescript-eslint/triple-slash-reference': 'off', // @TECH_DEBT: Enable, disallowing in all cases - N8N-5820

		/**
		 * https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/naming-convention.md
		 */
		'@typescript-eslint/naming-convention': [
			'error',
			{
				selector: 'import',
				format: ['camelCase', 'PascalCase'],
			},
		],

		/**
		 * https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/return-await.md
		 */
		'@typescript-eslint/return-await': ['error', 'always'],

		/**
		 * https://typescript-eslint.io/rules/explicit-member-accessibility/
		 */
		'@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],

		// ----------------------------------
		//       eslint-plugin-import
		// ----------------------------------

		/**
		 * https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-cycle.md
		 */
		'import/no-cycle': ['error', { ignoreExternal: false, maxDepth: 3 }],

		/**
		 * https://github.com/import-js/eslint-plugin-import/blob/master/docs/rules/no-default-export.md
		 */
		'import/no-default-export': 'error',

		/**
		 * https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-unresolved.md
		 */
		'import/no-unresolved': ['error', { ignore: ['^virtual:'] }],

		/**
		 * https://github.com/import-js/eslint-plugin-import/blob/master/docs/rules/order.md
		 */
		'import/order': [
			'error',
			{
				alphabetize: {
					order: 'asc',
					caseInsensitive: true,
				},
				groups: [['builtin', 'external'], 'internal', ['parent', 'index', 'sibling'], 'object'],
				'newlines-between': 'always',
			},
		],

		// ----------------------------------
		//   eslint-plugin-n8n-local-rules
		// ----------------------------------

		'n8n-local-rules/no-uncaught-json-parse': 'error',

		'n8n-local-rules/no-json-parse-json-stringify': 'error',

		'n8n-local-rules/no-unneeded-backticks': 'error',

		'n8n-local-rules/no-interpolation-in-regular-string': 'error',

		'n8n-local-rules/no-unused-param-in-catch-clause': 'error',

		'n8n-local-rules/no-useless-catch-throw': 'error',

		'n8n-local-rules/no-plain-errors': 'error',

		// ******************************************************************
		//                    overrides to base ruleset
		// ******************************************************************

		// ----------------------------------
		//              ESLint
		// ----------------------------------

		/**
		 * https://eslint.org/docs/rules/class-methods-use-this
		 */
		'class-methods-use-this': 'off',

		/**
		 * https://eslint.org/docs/rules/eqeqeq
		 */
		eqeqeq: 'error',

		/**
		 * https://eslint.org/docs/rules/no-plusplus
		 */
		'no-plusplus': 'off',

		/**
		 * https://eslint.org/docs/rules/object-shorthand
		 */
		'object-shorthand': 'error',

		/**
		 * https://eslint.org/docs/rules/prefer-const
		 */
		'prefer-const': 'error',

		/**
		 * https://eslint.org/docs/rules/prefer-spread
		 */
		'prefer-spread': 'error',

		// These are tuned off since we use `noUnusedLocals` and `noUnusedParameters` now
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': 'off',

		/**
		 * https://www.typescriptlang.org/docs/handbook/enums.html#const-enums
		 */
		'no-restricted-syntax': [
			'error',
			{
				selector: 'TSEnumDeclaration:not([const=true])',
				message:
					'Do not declare raw enums as it leads to runtime overhead. Use const enum instead. See https://www.typescriptlang.org/docs/handbook/enums.html#const-enums',
			},
		],

		// ----------------------------------
		//              import
		// ----------------------------------

		/**
		 * https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/prefer-default-export.md
		 */
		'import/prefer-default-export': 'off',

		// ----------------------------------
		//         no-unused-imports
		// ----------------------------------

		/**
		 * https://github.com/sweepline/eslint-plugin-unused-imports/blob/master/docs/rules/no-unused-imports.md
		 */
		'unused-imports/no-unused-imports': process.env.NODE_ENV === 'development' ? 'warn' : 'error',

		/** https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-unnecessary-await.md */
		'unicorn/no-unnecessary-await': 'error',

		/** https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-useless-promise-resolve-reject.md */
		'unicorn/no-useless-promise-resolve-reject': 'error',

		'lodash/path-style': ['error', 'as-needed'],
		'lodash/import-scope': ['error', 'method'],
	},

	overrides: [
		{
			files: ['test/**/*.ts', '**/__tests__/*.ts', '**/*.cy.ts'],
			rules: {
				'n8n-local-rules/no-plain-errors': 'off',
				'n8n-local-rules/no-skipped-tests':
					process.env.NODE_ENV === 'development' ? 'warn' : 'error',

				// TODO: Remove these
				'@typescript-eslint/ban-ts-comment': 'off',
				'@typescript-eslint/naming-convention': 'off',
				'import/no-duplicates': 'off',
				'@typescript-eslint/no-empty-function': 'off',
				'@typescript-eslint/no-loop-func': 'off',
				'@typescript-eslint/no-non-null-assertion': 'off',
				'@typescript-eslint/no-shadow': 'off',
				'@typescript-eslint/no-throw-literal': 'off',
				'@typescript-eslint/no-unsafe-argument': 'off',
				'@typescript-eslint/no-unsafe-assignment': 'off',
				'@typescript-eslint/no-unsafe-call': 'off',
				'@typescript-eslint/no-unsafe-member-access': 'off',
				'@typescript-eslint/no-unsafe-return': 'off',
				'@typescript-eslint/no-unused-expressions': 'off',
				'@typescript-eslint/no-use-before-define': 'off',
				'@typescript-eslint/no-var-requires': 'off',
				'@typescript-eslint/prefer-nullish-coalescing': 'off',
				'@typescript-eslint/prefer-optional-chain': 'off',
				'@typescript-eslint/restrict-plus-operands': 'off',
				'@typescript-eslint/restrict-template-expressions': 'off',
				'@typescript-eslint/unbound-method': 'off',
				'id-denylist': 'off',
				'import/no-default-export': 'off',
				'import/no-extraneous-dependencies': 'off',
				'n8n-local-rules/no-uncaught-json-parse': 'off',
				'prefer-const': 'off',
				'prefer-spread': 'off',
			},
		},
	],
});
