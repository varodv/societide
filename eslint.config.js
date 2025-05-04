import antfu from '@antfu/eslint-config';

export default antfu(
  {
    typescript: {
      tsconfigPath: 'tsconfig.json',
    },
    stylistic: {
      semi: true,
    },
    formatters: true,
    test: {
      overrides: {
        'test/prefer-lowercase-title': [
          'error',
          {
            ignore: ['describe'],
          },
        ],
      },
    },
  },
  {
    ignores: ['**/*.json', '**/*.md'],
    rules: {
      'max-len': [
        'error',
        {
          code: 100,
        },
      ],
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      'ts/no-unsafe-assignment': 'off',
      'ts/no-unsafe-call': 'off',
      'ts/no-unsafe-member-access': 'off',
      'ts/no-unsafe-return': 'off',
    },
  },
);
