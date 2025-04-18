<script setup>
import {
  useLayout,
} from './composables/layout'

const {
  layoutConfig,
  layoutState,
  setActiveMenuItem,
  onMenuToggle,
} = useLayout()
const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
  index: {
    type: Number,
    default: 0,
  },
  root: {
    type: Boolean,
    default: true,
  },
  parentItemKey: {
    type: String,
    default: null,
  },
})
const isActiveMenu = ref(false)
const itemKey = ref(null)

onBeforeMount(() => {
  itemKey.value = props.parentItemKey ? props.parentItemKey + '-' + props.index : String(props.index)
  const activeItem = layoutState.activeMenuItem.value

  isActiveMenu.value = activeItem === itemKey.value || activeItem
    ? activeItem.startsWith(itemKey.value
      + '-')
    : false
})

watch(
  () => layoutConfig.activeMenuItem.value,
  (newVal) => {
    isActiveMenu.value = newVal === itemKey.value || newVal.startsWith(itemKey.value + '-')
  },
)

const itemClick = (event, item) => {
  if (item.disabled) {
    event.preventDefault()

    return
  }

  const {
    overlayMenuActive,
    staticMenuMobileActive,
  } = layoutState

  if ((item.to || item.url) && (staticMenuMobileActive.value || overlayMenuActive.value)) {
    onMenuToggle()
  }

  if (item.command) {
    item.command({
      originalEvent: event,
      item: item,
    })
  }

  if (item.items) {
    const foundItemKey = isActiveMenu.value ? props.parentItemKey : itemKey
    setActiveMenuItem(foundItemKey)
  }
}
</script>

<template>
  <li :class="{ 'layout-root-menuitem': root, 'active-menuitem': isActiveMenu }">
    <div
      v-if="root && item.visible !== false"
      class="layout-menuitem-root-text"
    >
      {{ item . label }}
    </div>
    <a
      v-if="(!item.to || item.items) && item.visible !== false"
      :href="item.url"
      :class="item.class"
      :target="item.target"
      tabindex="0"
      @click="itemClick($event, item, index)"
    >
      <i
        :class="item.icon"
        class="layout-menuitem-icon"
      />
      <span class="layout-menuitem-text">{{ item . label }}</span>
      <i
        v-if="item.items"
        class="pi pi-fw pi-angle-down layout-submenu-toggler"
      />
    </a>
    <router-link
      v-if="item.to && !item.items && item.visible !== false"
      tabindex="0"
      active-class="active-route"
      :to="item.to"
      @click="itemClick($event, item, index)"
    >
      <i
        :class="item.icon"
        class="layout-menuitem-icon"
      />
      <span class="layout-menuitem-text">{{ item . label }}</span>
      <i
        v-if="item.items"
        class="pi pi-fw pi-angle-down layout-submenu-toggler"
      />
    </router-link>
    <Transition
      v-if="item.items && item.visible !== false"
      name="layout-submenu"
    >
      <ul
        v-show="root ? true : isActiveMenu"
        class="layout-submenu"
      >
        <app-menu-item
          v-for="(child, i) in item.items"
          :key="child"
          :index="i"
          :item="child"
          :parent-item-key="itemKey"
          :root="false"
        />
      </ul>
    </Transition>
  </li>
</template>

<style lang="scss" scoped></style>
