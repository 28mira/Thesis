import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ImageUploading from "react-images-uploading";
import AddPohotoAlternate from "@mui/icons-material/AddPhotoAlternate";
import { HideImage } from "@mui/icons-material";
import { Typography } from "@mui/material";

const UserModel = () => {
  const [images, setImages] = React.useState<any[]>([]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const formData = new FormData();

      images.forEach((img) => {
        formData.append("images", img.file);
      });

      const epochsInput = (event.target as HTMLFormElement).epochs.value;
      formData.append("epochs", epochsInput);

      const response = await fetch("http://localhost:5000/api/userModel", {
        method: "POST",
        body: formData,
      });

      const resp = await response.json();
      console.log("Success:", resp);
    } catch (error) {
      console.error("Error", error);
    }
  };

  const OnChange = (imageList: any[], addUpdateIndex: any) => {
    let list_size = 0;
    for (let i = 0; i < imageList.length; i++) {
      list_size += imageList[i].file.size;
    }
    if (list_size > 5000000) {
      alert("A feltöltött képek mérete nem haladhatja meg az 5MB-ot!");
      return;
    } else {
      setImages(imageList);
    }
  };
  return (
    <>
      <Typography sx={{}}>Hali</Typography>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          name="epochs"
          id="epochs"
          max={200}
          min={80}
          defaultValue={100}
        />
        <ImageUploading
          multiple
          value={images}
          onChange={OnChange}
          dataURLKey="data_url"
          acceptType={["jpg"]}
        >
          {({ imageList, onImageUpload, onImageRemove }) => (
            <Box sx={{ display: "flex", flexDirection: "row" }}>
              <Tooltip title="Kép feltöltése">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onImageUpload}
                >
                  <AddPohotoAlternate />
                </Button>
              </Tooltip>
              {imageList.map((image, index) => (
                <div key={index} className="imageItem">
                  <Box sx={{ margin: 1, padding: 1 }}>
                    <img src={image["data_url"]} alt="image" width="100" />
                  </Box>
                  <div>
                    <Tooltip title="Feltöltött képek eltávolítása">
                      <Button
                        sx={{ marginRight: 1 }}
                        variant="contained"
                        color="error"
                        onClick={() => onImageRemove(index)}
                      >
                        <HideImage />
                      </Button>
                    </Tooltip>
                    &nbsp;
                  </div>
                </div>
              ))}
            </Box>
          )}
        </ImageUploading>
        <Button type="submit">Tanítás</Button>
      </form>
    </>
  );
};

export default UserModel;
