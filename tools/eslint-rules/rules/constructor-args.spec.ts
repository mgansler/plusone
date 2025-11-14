import type { RuleTesterConfig } from '@typescript-eslint/rule-tester'
import { RuleTester } from '@typescript-eslint/rule-tester'

import { rule, RULE_NAME } from './constructor-args'

// Set the afterAll hook for RuleTester to work with Jest
RuleTester.afterAll = afterAll

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
} as RuleTesterConfig)

ruleTester.run<string, []>(RULE_NAME, rule, {
  valid: [
    {
      name: 'private readonly parameter',
      code: `class MyClass {
        constructor(private readonly service: MyService) {}
      }`,
    },
    {
      name: 'protected readonly parameter',
      code: `class MyClass {
        constructor(protected readonly service: MyService) {}
      }`,
    },
    {
      name: 'multiple private readonly parameters',
      code: `class MyClass {
        constructor(
          private readonly service1: MyService,
          private readonly service2: AnotherService,
          protected readonly config: Config
        ) {}
      }`,
    },
    {
      name: 'constructor without parameters',
      code: `class MyClass {
        constructor() {}
      }`,
    },
    {
      name: 'constructor with regular parameters (not property parameters)',
      code: `class MyClass {
        private service: MyService;
        constructor(service: MyService) {
          this.service = service;
        }
      }`,
    },
  ],
  invalid: [
    {
      name: 'missing accessibility modifier',
      code: `class MyClass {
        constructor(readonly service: MyService) {}
      }`,
      output: `class MyClass {
        constructor(private readonly service: MyService) {}
      }`,
      errors: [{ messageId: 'missingAccessibility' }],
    },
    {
      name: 'missing readonly modifier',
      code: `class MyClass {
        constructor(private service: MyService) {}
      }`,
      output: `class MyClass {
        constructor(private readonly service: MyService) {}
      }`,
      errors: [{ messageId: 'missingReadonly' }],
    },
    {
      name: 'public parameter (should be private or protected)',
      code: `class MyClass {
        constructor(public readonly service: MyService) {}
      }`,
      output: `class MyClass {
        constructor(private readonly service: MyService) {}
      }`,
      errors: [{ messageId: 'notPrivateOrProtected' }],
    },
    {
      name: 'public parameter without readonly',
      code: `class MyClass {
        constructor(public service: MyService) {}
      }`,
      output: `class MyClass {
        constructor(private readonly service: MyService) {}
      }`,
      errors: [{ messageId: 'notPrivateOrProtected' }, { messageId: 'missingReadonly' }],
    },
    {
      name: 'mixed valid and invalid parameters',
      code: `class MyClass {
        constructor(
          private readonly goodService: Service1,
          public badService: Service2
        ) {}
      }`,
      output: `class MyClass {
        constructor(
          private readonly goodService: Service1,
          private readonly badService: Service2
        ) {}
      }`,
      errors: [{ messageId: 'notPrivateOrProtected' }, { messageId: 'missingReadonly' }],
    },
  ],
})
