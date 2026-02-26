import os
from pathlib import Path

def prefijar_archivos():
    # Solicitar datos al usuario
    carpeta_input = input("Ingresa la ruta completa de la carpeta: ").strip()
    prefijo = input("Ingresa el string a anteponer (ej: 'CA - '): ")

    carpeta = Path(carpeta_input)

    # Validar carpeta
    if not carpeta.exists() or not carpeta.is_dir():
        print("❌ La ruta indicada no existe o no es una carpeta válida.")
        return

    archivos_renombrados = 0
    archivos_omitidos = 0

    for archivo in carpeta.iterdir():
        # Solo archivos (no carpetas)
        if archivo.is_file():

            # Evitar duplicar el prefijo si ya existe
            if archivo.name.startswith(prefijo):
                print(f"⏭ Omitido (ya tiene prefijo): {archivo.name}")
                archivos_omitidos += 1
                continue

            nuevo_nombre = prefijo + archivo.name
            nueva_ruta = carpeta / nuevo_nombre

            # Evitar sobrescribir archivos existentes
            if nueva_ruta.exists():
                print(f"⚠ No se renombra porque ya existe: {nuevo_nombre}")
                archivos_omitidos += 1
                continue

            archivo.rename(nueva_ruta)
            print(f"✔ Renombrado: {archivo.name} → {nuevo_nombre}")
            archivos_renombrados += 1

    print("\n--- Resultado ---")
    print(f"Archivos renombrados: {archivos_renombrados}")
    print(f"Archivos omitidos: {archivos_omitidos}")


if __name__ == "__main__":
    prefijar_archivos()
