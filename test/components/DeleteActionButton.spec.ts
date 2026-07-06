/**
 * DeleteActionButton Component Tests
 */

import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DeleteActionButton from '~/components/admin/DeleteActionButton.vue';

const stubs = {
  'v-tooltip': {
    template: '<div class="tooltip"><slot name="activator" :props="{}" /></div>',
    props: ['text', 'disabled'],
  },
  'v-btn': {
    template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    props: ['disabled', 'icon', 'variant', 'color', 'size'],
    emits: ['click'],
  },
};

describe('DeleteActionButton', () => {
  it('is disabled when canDelete is false', async () => {
    const wrapper = await mountSuspended(DeleteActionButton, {
      props: { canDelete: false },
      global: { stubs },
    });

    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });

  it('emits click when canDelete is true', async () => {
    const wrapper = await mountSuspended(DeleteActionButton, {
      props: { canDelete: true },
      global: { stubs },
    });

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('does not emit click when canDelete is false', async () => {
    const wrapper = await mountSuspended(DeleteActionButton, {
      props: { canDelete: false },
      global: { stubs },
    });

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('click')).toBeUndefined();
  });
});
