import { ESLintUtils, TSESTree } from '@typescript-eslint/utils'

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-constructor-args"
export const RULE_NAME = 'constructor-args'

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `Enforces that constructor parameters are marked as private or protected and readonly`,
    },
    fixable: 'code',
    schema: [],
    messages: {
      missingAccessibility: 'Constructor parameter "{{paramName}}" must be marked as private or protected',
      missingReadonly: 'Constructor parameter "{{paramName}}" must be marked as readonly',
      notPrivateOrProtected: 'Constructor parameter "{{paramName}}" must be private or protected (not public)',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      MethodDefinition(node) {
        // Only check constructors
        if (node.kind !== 'constructor') {
          return
        }

        // Check each parameter
        for (const param of node.value.params) {
          // Skip if not a TSParameterProperty (parameter with accessibility modifiers)
          if (param.type !== TSESTree.AST_NODE_TYPES.TSParameterProperty) {
            continue
          }

          const paramProperty = param as TSESTree.TSParameterProperty
          const paramName = getParameterName(paramProperty.parameter)

          // Check if parameter has accessibility modifier
          const hasAccessibility = paramProperty.accessibility !== undefined
          const isPublic = paramProperty.accessibility === 'public'
          const isReadonly = paramProperty.readonly === true

          // Report if accessibility is missing
          if (!hasAccessibility) {
            context.report({
              node: param,
              messageId: 'missingAccessibility',
              data: {
                paramName,
              },
              fix(fixer) {
                // Add 'private ' before the parameter
                return fixer.insertTextBefore(param, 'private ')
              },
            })
          }
          // Report if it's public
          else if (isPublic) {
            context.report({
              node: param,
              messageId: 'notPrivateOrProtected',
              data: {
                paramName,
              },
              fix(fixer) {
                // Replace 'public' with 'private'
                const sourceCode = context.sourceCode
                const tokenBefore = sourceCode.getFirstToken(param)
                if (tokenBefore?.value === 'public') {
                  // If also missing readonly, replace with 'private readonly'
                  if (!isReadonly) {
                    return fixer.replaceText(tokenBefore, 'private readonly')
                  }
                  return fixer.replaceText(tokenBefore, 'private')
                }
                return null
              },
            })
          }

          // Report if not readonly (but only fix if not public, since public fix already handles it)
          if (!isReadonly) {
            context.report({
              node: param,
              messageId: 'missingReadonly',
              data: {
                paramName,
              },
              fix(fixer) {
                // Don't fix here if it's public, as the public fix will handle both
                if (isPublic) {
                  return null
                }

                const sourceCode = context.sourceCode

                // Find where to insert 'readonly'
                // If there's an accessibility modifier, insert after it
                if (hasAccessibility) {
                  const firstToken = sourceCode.getFirstToken(param)
                  if (firstToken && (firstToken.value === 'private' || firstToken.value === 'protected')) {
                    return fixer.insertTextAfter(firstToken, ' readonly')
                  }
                } else {
                  // No accessibility modifier, insert at the beginning
                  return fixer.insertTextBefore(param, 'readonly ')
                }
                return null
              },
            })
          }
        }
      },
    }
  },
})

/**
 * Helper function to extract parameter name from different parameter types
 */
function getParameterName(parameter: TSESTree.Parameter): string {
  if (parameter.type === TSESTree.AST_NODE_TYPES.Identifier) {
    return parameter.name
  }
  if (parameter.type === TSESTree.AST_NODE_TYPES.AssignmentPattern) {
    if (parameter.left.type === TSESTree.AST_NODE_TYPES.Identifier) {
      return parameter.left.name
    }
  }
  return 'unknown'
}
