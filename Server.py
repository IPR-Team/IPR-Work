import asyncio
import websockets
import os
import xml.etree.ElementTree as ET
################################ Retrieves the scanable files
def get_files():
    files = list()
    for file in os.listdir(".\Dateien"):
        if ".xsd" in file:
            files.append(file)
    return files
################################ Sets up the file scanning
def scan_schema(path):
    root = ET.parse(path).getroot()
    return parse_element(root, "./*", 1)
################################ Recursivly scans the file
def parse_element(root, tree_path, stage):
    data = []
    subelements = root.findall(tree_path)
    element_name = ""
    attribute_status = ""                           # If the element isn't an attribute it remains empty, else ":Attribute"
    has_subelements = False
    for element in subelements:
        if element.get("name") != None:             # Only elements with names are of importance
            temp = tree_path+"[@name='"+element.get("name")+"']/*"  # Path of current element
            if root.findall(temp+"/*"):
                has_subelements = True
            element_name = element.get("name")
            if "attribute" in element.tag:          # Attribute
                attribute_status = ":Attribute"
            if stage != 1:                          # Root is on stage 1 and will be ignored
                data.append(element_name+":"+str(stage)+":"+str(has_subelements)+attribute_status)
            if root.findall(temp+"/*"):             # If this elements has subelements, another call has to be done
                data += parse_element(root, temp, stage+1)
        else:
            data += parse_element(root, tree_path+"/*", stage)
    return data
################################ Retrieves the data in the CSV format
def scan_as_csv(path, element):
    tree = ET.parse(path)
    root = tree.getroot()
    data = [""]
    for child in root.iter():
        line = ""
        if child.tag == element:
            for item in child.iter():
                if item.text.strip():               # Removes 'empty' entries
                    if item.tag not in data[0]:
                        data[0] += item.tag+","
                    line += item.text.strip()+","
        elif element in child.attrib:
            data[0] = element
            data.append(child.get(element))
        if line != "":
            data.append(line)
    i = 0
    while i < len(data):                            # Removes the last comma
        if data[i][-1:] == ",":
            data[i] = data[i][:-1]
        i += 1
    return data
################################ Retrieves the data in the XML format
def scan_as_xml(path, element):
    file = open(path)
    lines = file.readlines()
    data = list()
    add_data = 0
    for line in lines:
        if "<"+element in line:
            add_data = 1
        # Attributes cannot be displayed as xml -> output as CSV
        elif element+"=" in line:
            return scan_as_csv(path, element)
        if add_data:
            data.append(line)
        if "</"+element in line:
            add_data = 0
    return data
################################ Writes user input to a file
def write_to_file(path, content):
    file = open(path, "r")
    lines = file.readlines()
    file.close()
    lines.insert(len(lines)-1, content)
    file = open(path, "w")
    file.writelines(lines)
    file.close()
################################ Server
async def echo(websocket, path):
    files = get_files()                             # Server retrieves selectable schemas
    data = list()                                   # Contains the actual data
    path = ""                                       # Will later on contain the path to the selected file
    async for message in websocket:
        message_content = message.split(":")
        message_id = int(message_content[0])        # Each message from the client contains an ID for better management

        if message_id == 1:                         # Connection established
            response = "Welcome! Please select a file to read:"
            counter = 1
            for file in files:
                response += "\n["+str(counter)+"] "+file
                counter += 1
            await websocket.send(response)
        elif message_id == 2:                       # User selected a file
            file_index = int(message_content[1])
            path = ".\\Dateien\\"+files[file_index] # Set path to file
            data = scan_schema(path)                # Scans the selected file
            response = "Select the data you want to collect:"
            counter = 1
            for element in data:                    # Listing the XML tags and attributes
                response += "\n["+str(counter)+"] "+element
                counter += 1
            await websocket.send(response)
        elif message_id == 3:                       # User selected the desired data
            path = "."+path.split(".")[1]+".xml"    # Switch path from .xsd to .xml file to parse the actual content
            #######################################################################################
            # HIER NUTZER SELECTION PARSEN! KOMMT ALS DICTIONARY IN FORM 3:KEY = VALUE|KEY = VALUE|...
            # BEISPIEL VON MORCI: ICH SUCHE DEN VORNAMEN VON LEUTEN DIE IN WILDAU WOHNEN...
            #######################################################################################
            response = "Select the output format:\n[1] CSV\n[2] XML"
            await websocket.send(response)
        elif message_id == 4:                       # User selected the output format
            output_format = int(message_content[1])
            if output_format == 0:
                data = scan_as_csv(path, element)
            else:
                data = scan_as_xml(path, element)
            response = ""
            if len(data) == 1 and data[0] == "":    # CSV has a set header => len(data) will never be 0
                response = "Could not find any matching data!"
            elif data:
                for data_set in data:
                    response += "\n"+data_set
            else:                                   # Empty list
                response = "Could not find any matching data!"
            response += "\n\nDo you want to add data:\n[1] Yes\n[2] No"
            await websocket.send(response)
        elif message_id == 5:                       # User wants to add data to an XML file
            response = "Select a file to add data:"
            counter = 1
            for file in files:
                response += "\n["+str(counter)+"] "+file
                counter += 1
            await websocket.send(response)
        elif message_id == 6:                       # User selected a file to add data
            file_index = int(message_content[1])
            path = ".\\Dateien\\"+files[int(file_index)] # Set path to file
            data = scan_schema(path)
            response = ""                           
            for data_set in data:
                response += data_set+"|"            # User input is handled in the Client => "|" is used for parsing
            await websocket.send(response)
        elif message_id == 7:                       # User input for the file
            user_input = message_content[1]
            path = "."+path.split(".")[1]+".xml"
            write_to_file(path, user_input)
            response = "Transfer finished succesfully.\nClosing connection..."
            await websocket.send(response)
            
def main():
    server = websockets.serve(echo, 'localhost', 1511)
    asyncio.get_event_loop().run_until_complete( server )
    asyncio.get_event_loop().run_forever()

if __name__ == "__main__":
    main()

