import React from 'react';

import "react-dropzone-uploader/dist/styles.css";
import "./styles/dropZoneInput.css";
import Dropzone from 'react-dropzone-uploader';

// preview component
const Preview = ({ meta }) => {
    const { name, percent, status } = meta
    return (
      <span style={{ alignSelf: 'flex-start', margin: '10px 3%' }}>
        {name}, {Math.round(percent)}%, {status}
      </span>
    )
  }
  

export const DropZoneInput = () => {
 //   const getUploadParams = () => ({ url: 'http://localhost:9000/csv' })
  // specify upload params and API url to file upload
  const getUploadParams = ({ file }) => {
    const body = new FormData();
    body.append('dataFiles', file);
    return { url: 'http://localhost:9000/csv', body }
  }


  const handleSubmit = (files, allFiles) => {
    console.log(files.map(f => f.meta))
    allFiles.forEach(f => f.remove())
  }
  // handle the status of the file upload
  const handleChangeStatus = ({ xhr }) => {
    if (xhr) {
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          const result = JSON.parse(xhr.response);
          console.log(result);
        }
      }
    }
  }

  return (
    <div className="DropZoneInput">
     
        <Dropzone
          getUploadParams={getUploadParams}      
          styles={{
            dropzone: { overflow: 'auto', border: '1px solid #999', background: '#f5f5f5' },
            inputLabelWithFiles: { margin: '20px 3%' }
          }}
          canRemove={false}
          onSubmit={handleSubmit}
          PreviewComponent={Preview}
        />
    </div>
  );
}

export default DropZoneInput;