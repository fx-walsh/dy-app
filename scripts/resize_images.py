import os
from PIL import Image

# =========================================================
# GLOBAL CONFIGURATION VARIABLES
# =========================================================

# The directory where your original large images are stored.
# IMPORTANT: Use a full (absolute) path or a path relative to where you run the script.
INPUT_DIR = '../damn-yankee-data/page-images/' 

# The directory where the new thumbnail images will be saved.
# The script will create this directory if it doesn't exist.
OUTPUT_DIR = '../damn-yankee-data/page-images-thumbnails/'

# The maximum width for the resized image.
# The height will be adjusted automatically to maintain the aspect ratio.
MAX_WIDTH = 300 

# =========================================================
# RESIZING FUNCTION
# =========================================================

def resize_images(input_dir, output_dir, max_width):
    """
    Resizes all PNG images in the input_dir and saves them as thumbnails 
    to the output_dir.
    """
    # 1. Ensure the output directory exists
    os.makedirs(output_dir, exist_ok=True)

    print(f"Starting resize job...")
    print(f"Input Directory: {input_dir}")
    print(f"Output Directory: {output_dir}\n")

    print(os.listdir(input_dir))

    # 2. Loop through all files in the input directory
    for filename in os.listdir(input_dir):
        if filename.lower().endswith('.png'):
            input_path = os.path.join(input_dir, filename)
            
            # Create the new filename with the '_thumbnail' suffix
            name_part, ext_part = os.path.splitext(filename)
            output_filename = f"{name_part}_thumbnail{ext_part}"
            output_path = os.path.join(output_dir, output_filename)
            
            try:
                # Open the image
                img = Image.open(input_path)
                
                # Calculate the new height to maintain the aspect ratio
                original_width, original_height = img.size
                
                # Only resize if the image is actually larger than the MAX_WIDTH
                if original_width > max_width:
                    ratio = max_width / original_width
                    new_height = int(original_height * ratio)
                    new_size = (max_width, new_height)

                    # Resize the image using the antialias filter for quality
                    resized_img = img.resize(new_size, Image.Resampling.LANCZOS)
                    
                    # Save the new thumbnail image (PNG supports transparency)
                    resized_img.save(output_path, 'PNG', optimize=True)
                    
                    print(f"✅ Resized and saved: {output_filename}")
                else:
                    # If the image is already small, just copy it
                    img.save(output_path, 'PNG', optimize=True)
                    print(f"➡️ Image is small, copied: {output_filename}")

            except Exception as e:
                print(f"❌ Error processing {filename}: {e}")

    print("\nImage processing complete!")


# 3. Execute the function
if __name__ == "__main__":
    # Create the sample directories if they don't exist (for easy testing)
    os.makedirs(INPUT_DIR, exist_ok=True)
    
    # Run the main function
    resize_images(INPUT_DIR, OUTPUT_DIR, MAX_WIDTH)