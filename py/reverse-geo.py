# match al-turayya places
import reverse_geocoder as rg
coordinates = (39.46975, -0.37739)
results = rg.search(coordinates)
print(results)