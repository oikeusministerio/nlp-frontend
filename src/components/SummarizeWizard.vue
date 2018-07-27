<template>
  <div>
    <span class="label">Lauseiden valinta</span>

    <div class="container">
      <div
        :key="note.id"
        v-for="note in notes"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      notes: [{
        id: 1,
        text: 'Marco',
      }, {
        id: 2,
        text: 'Polo'
      }]
    };
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  width: 400px;
  height: 600px;
  margin: 5px;
  padding: 10px;
  border: 1px solid green;
}

.label {
  font-size: 10px;
  color: green;
}
</style>
