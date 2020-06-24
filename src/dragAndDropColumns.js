import React, { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";

export const DragAndDropColumn = ({pId, initialFields, fieldsets}) => {

    const [fields, setFields] = useState(initialFields);
    const [primaryId, setPrimaryId]  = useState(pId);

    const onDragEnd = useCallback(
        ({ source, destination }) => {
            if (destination) {
                setFields(fields => {
                    const reordered = [...fields];
                    const [field] = reordered.splice(source.index, 1);
                    reordered.splice(destination.index, 0, field);

                    return reordered;
                });
            }
        },
        [setFields]
    );

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
                {provided => (
                    <>
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="fields"
                        >
                            {fields.map((field, index) => (
                                <Draggable
                                    key={field.id}
                                    draggableId={field.id}
                                    index={index}
                                >
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={
                                                snapshot.isDragging ? "field isDragged" : "field"
                                            }
                                        >
                                            <div className="bar">
                                                <div />
                                                <div />
                                                <div />
                                            </div>
                                            <span>{index}</span>
                                            <input
                                                value={field.fieldName}
                                                placeholder="Column Name"
                                                onChange={evt => {
                                                    const fieldName = evt.target.value;
                                                    setFields(fields => [
                                                        ...fields.slice(0, index),
                                                        { ...field, fieldName },
                                                        ...fields.slice(index + 1)
                                                    ]);
                                                }}
                                            />
                                            <button
                                                className="primaryToggle"
                                                disabled={field.id === primaryId}
                                                onClick={() => setPrimaryId(field.id)}
                                            >
                                                Identifier
                </button>
                                            <button
                                                className={
                                                    field.shouldMerge
                                                        ? "shouldMerge active"
                                                        : "shouldMerge"
                                                }
                                                onClick={() =>
                                                    setFields(fields => [
                                                        ...fields.slice(0, index),
                                                        { ...field, shouldMerge: !field.shouldMerge },
                                                        ...fields.slice(index + 1)
                                                    ])
                                                }
                                            >
                                                Fixed
                </button>
                                            <button
                                                className="delete"
                                                disabled={fields.length === 1}
                                                onClick={() =>
                                                    setFields(fields => [
                                                        ...fields.slice(0, index),
                                                        ...fields.slice(index + 1)
                                                    ])
                                                }
                                            >
                                                X
                </button>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                        <button
                            className="addField"
                            onClick={() =>
                                setFields(fields => [
                                    ...fields,
                                    {
                                        id: uuidv4(),
                                        fieldName: "",
                                        shouldMerge: false
                                    }
                                ])
                            }
                        >
                            Add Column
        </button>
                    </>
                )}
            </Droppable>
        </DragDropContext>
    )
}

export default DragAndDropColumn;