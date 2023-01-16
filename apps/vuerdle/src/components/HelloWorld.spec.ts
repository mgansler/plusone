import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import HelloWorld from './HelloWorld.vue'

describe('HelloWorld', () => {
  it('should renders properly', () => {
    const wrapper = mount(HelloWorld)
    expect(wrapper.text()).toContain('Hello World')
  })
})
