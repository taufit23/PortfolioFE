<template>
  <div class="p-6">
    <div class="font-semibold text-xl mb-4">
      Loading...
    </div>
    <div class="rounded-border border border-surface p-6">
      <div class="flex mb-4">
        <Skeleton
          shape="circle"
          size="4rem"
          class="mr-2"
        />
        <div>
          <Skeleton
            width="10rem"
            class="mb-2"
          />
          <Skeleton
            width="5rem"
            class="mb-2"
          />
          <Skeleton height=".5rem" />
        </div>
      </div>
      <Skeleton
        width="100%"
        height="150px"
      />
      <div class="flex justify-between mt-4">
        <Skeleton
          width="4rem"
          height="2rem"
        />
        <Skeleton
          width="4rem"
          height="2rem"
        />
      </div>
    </div>
  </div>
</template>
