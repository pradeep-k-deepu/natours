const locations = JSON.parse(document.getElementById('map').dataset.locations);

accessToken =
  'pk.eyJ1IjoicHJhZGVlcC1rLWRlZXB1IiwiYSI6ImNrbnB5ZHdpODA5bzIybnF3bGgxY3I2dTkifQ.QE3paTgeuoZxfiFqSPqTyQ';
var map = new Map({
  container: 'YOUR_CONTAINER_ELEMENT_ID',
  style: 'mapbox://styles/mapbox/streets-v11',
});
