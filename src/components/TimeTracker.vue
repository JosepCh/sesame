<template>
  <section class="w-9/12 m-2 rounded-full p-2 bg-slate-300">
    <!-- Mostramos la informacion cuando no este cargando y este llena -->
    <section
      v-if="infoEmpleado !== null && !loadingData"
      class="flex flex-row justify-center items-center gap-3"
    >
      <!-- Timer -->
      <div>
        <p>{{ formatDate(this.totalTime) }}</p>
      </div>
      <!-- Botones acciones -->
      <div>
        <button
          class="bg-green-500 py-1 px-7 rounded-full text-white"
          v-if="isOffline"
          @click="clockIn(infoEmpleado)"
        >Entrar</button>
        <button
          class="bg-gray-400 py-1 px-7 rounded-full text-white"
          v-if="isOnline && !isPaused"
          @click="isPaused = !isPaused"
        >Pausar</button>
        <button
          class="bg-gray-400 py-1 px-7 rounded-full text-white"
          v-if="isOnline && isPaused"
          @click="isPaused = !isPaused"
        >Reanudar</button>
        <button
          class="bg-red-400 py-1 px-7 ml-2 rounded-full text-white"
          v-if="isOnline"
          @click="clockOut(infoEmpleado)"
        >Salir</button>
      </div>
      <!-- Divisor -->
      <div class="border-solid border-l-2 border-slate-400 h-10"></div>
      <!-- Imagen y estado -->
      <div class="relative">
        <img class="rounded-full w-4/5" alt="avatar" :src="avatar">
        <div
          class="absolute w-3 h-3 rounded-full -top-0.5 right-2.5"
          :class="{'bg-red-400': isOffline,'bg-green-400':isOnline}"
        ></div>
      </div>
      <!--Nombre, Menu y submenu -->
      <div class="relative">
        <span @click="openMenu = !openMenu; openSubmenu = false">
          <b>{{ infoEmpleado.firstName}} {{ infoEmpleado.lastName}}</b>
          <i class="arrow down ml-3"></i>
        </span>
        <ul
          v-show="openMenu"
          class="bg-white w-64 absolute top-10 -right-2 rounded-md shadow-md main"
        >
          <li class="p-3 relative" @click="openSubmenu = !openSubmenu">
            <i class="arrow left mr-1"></i>
            <span>Mis cuentas</span>
            <ul v-show="openSubmenu" class="bg-white absolute top-0 rounded-md -left-48 shadow-md">
              <li class="p-2 flex flex-row hover:bg-teal-100 rounded-md">
                <img :src="avatar" alt="avatar-mini" class="mr-1 ml-1 rounded-full flex-0.5">
                <div>
                  <div class="flex flex-row items-center justify-center">
                    <b class="text-sm mr-1">{{ infoEmpleado.company.name }}</b>
                    <span class="text-xs">{{ infoEmpleado.firstName}} {{ infoEmpleado.lastName}}</span>
                  </div>
                  <div>
                    <p class="text-xs">Hoy llevas {{ formatDate(totalTime) }}</p>
                  </div>
                </div>
              </li>
              <hr>
              <li class="p-2 flex flex-row hover:bg-teal-100 rounded-md">
                <img :src="avatar" alt="avatar-mini" class="mr-1 ml-1 rounded-full flex-0.5">
                <div>
                  <div class="flex flex-row items-center justify-center">
                    <b class="text-sm mr-1">{{ infoEmpleado.company.name }}</b>
                    <span class="text-xs">{{ infoEmpleado.firstName}} {{ infoEmpleado.lastName}}</span>
                  </div>
                  <div>
                    <p class="text-xs">Hoy llevas {{ formatDate(totalTime) }}</p>
                  </div>
                </div>
              </li>
            </ul>
          </li>
          <hr>
          <li class="p-3">Vista empleado</li>
          <hr>
          <li class="p-3">Mi perfil</li>
          <hr>
          <!-- Mostrar solo cuando este online -->
          <li class="p-3 bg-red-200" v-show="isOnline" @click="clockOut(infoEmpleado)">Cerrar Sesión</li>
        </ul>
      </div>
    </section>
    <!-- Loading que mostramos mientras se ejecutan las acciones -->
    <DataLoading v-if="loadingData" :text="textLoading"/>
  </section>
</template>

<script>
import DataLoading from "@/components/DataLoading.vue";

export default {
  name: "TimeTracker",
  props: {
    empleado: Object
  },
  components: {
    DataLoading
  },
  data: function() {
    return {
      infoEmpleado: null,
      status: undefined, // Estado
      totalTime: 0, // Segundos trabajando
      textLoading: "",
      loadingData: false,
      isPaused: false, // Comprobar pausa
      interval: null, // Intervalo suma segundos
      openMenu: false, // Abrir menu
      openSubmenu: false, // Abrir submenu
      url_in:
        "https://api-test.sesametime.com/schedule/v1/work-entries/clock-in", // Url clock-in
      url_out:
        "https://api-test.sesametime.com/schedule/v1/work-entries/clock-out", // Url clock-out
      avatar: "https://placekitten.com/g/50/50" // Random avatar
    };
  },
  mounted: function() {
    this.separateData(this.empleado);
  },
  computed: {
    isOnline: function() {
      return this.status === "online";
    },
    isOffline: function() {
      return this.status === "offline";
    }
  },
  watch: {
    status: function() {
      // Miramos que  el estado del trabajador sea online
      if (this.status === "online") {
        this.interval = setInterval(() => {
          // Si no esta pausado , sumamos 1 cada segundo al tiempo total
          !this.isPaused ? (this.totalTime += 1) : "";
        }, 1000);
      } else {
        // Si esta offline , limpiamos el intervalo para que deje de sumar
        clearInterval(this.interval);
      }
    }
  },
  methods: {
    separateData: function(data) {
      /**
       * Funcion encargada de desglosar la informacion que nos lleva por props para manejarla más facilmente
       */
      this.infoEmpleado = data.employee;
      this.status = this.infoEmpleado.workStatus;
      this.loadingData = false;
    },
    formatDate: function(sec) {
      /**
       * Función encargada de transformar los segundos transcurridos en horas, minutos y segundos sobrantes
       */
      let hours = Math.floor(sec / 3600);
      hours >= 1 ? (sec = sec - hours * 3600) : (hours = "00");
      let min = Math.floor(sec / 60);
      min >= 1 ? (sec = sec - min * 60) : (min = "00");
      sec < 1 ? (sec = "00") : 0;

      // Añadimos un 0 delante si son menor a 2 cifras
      hours.toString().length == 1 ? (hours = "0" + hours) : 0;
      min.toString().length == 1 ? (min = "0" + min) : 0;
      sec.toString().length == 1 ? (sec = "0" + sec) : 0;

      // Devolvemos string
      return hours + ":" + min + ":" + sec;
    },
    clockIn: function(infoEmpleado) {
      /**
       * Función encargada de fichar , pasando como informacion el id y el objeto workEntryIn
       */
      let that = this;
      this.textLoading = "Entrando";
      // Mostramos el loading al principio y los escondemos al final
      this.loadingData = true;
      this.$axios
        .post(this.url_in, {
          employeeId: infoEmpleado.id,
          workEntryIn: this.empleado.workEntryIn
        })
        .then(function(response) {
          console.log(response);
          // Si la respuesta es 200 , actualizamos los datos
          if (response.status === 200) {
            that.isPaused = false;
            that.separateData(response.data.data);
          }
        })
        .catch(function(error) {
          console.log(error);
          that.loadingData = false;
        });
    },
    clockOut: function(infoEmpleado) {
      /**
       * Función encargada de desfichar , pasando como informacion el id y el objeto workEntryIn
       */
      let that = this;
      this.textLoading = "Saliendo";
      // Mostramos el loading al principio y los escondemos al final
      this.loadingData = true;
      this.$axios
        .post(this.url_out, {
          employeeId: infoEmpleado.id,
          workEntryOut: this.empleado.workEntryOut
        })
        .then(function(response) {
          // Si la respuesta es 200 , actualizamos los datos
          response.status === 200 ? that.separateData(response.data.data) : "";
        })
        .catch(function(error) {
          console.log(error);
          that.loadingData = false;
        });
    }
  }
};
</script>

<style scoped>
.arrow {
  border: solid black;
  border-width: 0 1px 1px 0;
  display: inline-block;
  padding: 3px;
}
.down {
  transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
}
.left {
  transform: rotate(135deg);
  -webkit-transform: rotate(135deg);
}

ul.main::before {
  position: absolute;
  content: "";
  width: 0px;
  height: 0px;
  top: -0.75rem;
  border-right: 15px solid transparent;
  border-bottom: 15px solid white;
  border-left: 15px solid transparent;
  right: 1.5rem;
}
</style>


