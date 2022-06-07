<template>
  <div id="app" class="m-auto mt-16 bg-slate-200 w-9/12 h-4/5 flex items-center justify-center">
    <TimeTracker v-if="!loading" :empleado="information"/>
    <DataLoading v-if="loading" :text="textLoading"/>
  </div>
</template>

<script>
import TimeTracker from "@/components/TimeTracker.vue";
import DataLoading from "@/components/DataLoading.vue";

export default {
  name: "App",
  components: {
    TimeTracker,
    DataLoading
  },
  data: function() {
    return {
      information: null,
      loading: false,
      textLoading: "Cargando datos"
    };
  },
  beforeMount: function() {
    /**
     * Funcion que recoje la informacion de los empleados, si todo va correcto devuelve la informacion del primer empleado
     */
    let that = this;
    // Mostramos loading y luego lo ocultamos
    this.loading = true;
    this.$axios
      .get("https://api-test.sesametime.com/schedule/v1/work-entries")
      .then(function(response) {
        response.status === 200
          ? (that.information = response.data.data[0])
          : "";
      })
      .catch(function(error) {
        // handle error
        console.log(error);
      })
      .then(function() {
        that.loading = false;
      });
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
