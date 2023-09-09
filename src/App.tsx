import React, { useEffect, useState } from 'react';
import './App.css';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, InputAdornment, Popover, IconButton, List, ListItem, Menu, MenuItem, Tooltip, ListItemIcon, ListItemText, Select, InputLabel, FormControl } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import { DeleteDialogComponent } from './components/DeleteDialog';
import { SnackbarComponent } from './components/Snackbar';
import { CustomButton } from './components/Button';
import { CloudCircleTwoTone } from '@mui/icons-material';
import { saveImage } from './utils/saveImage';
import { AppSettings, ButtonProps, Config } from './types/types';
import useOBS from './utils/useObs';
import { guid } from './utils/guid';
import MovieIcon from '@mui/icons-material/Movie';

function App() {
  const [config, setConfig] = useState<Config>(() => {
    const savedConfig = window.localStorage.getItem('config');
    return JSON.parse(savedConfig || '{"buttons": []}');
  });
  const [open, setOpen] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState<Element | null>(null);
  const [configInput, setConfigInput] = useState('');
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [newButtonDialogOpen, setNewButtonDialogOpen] = useState(false);
  const [newButton, setNewButton] = useState<ButtonProps>({ id: guid, command: '', name: '', colorStart: '#000000', colorEnd: '#000000', textColor: '#ff2600', sceneName: '', imageName: '' });
  const [editButton, setEditButton] = useState<ButtonProps | null>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [scenesDialogOpen, setScenesDialogOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const savedSettings = window.localStorage.getItem('appSettings');
    return JSON.parse(savedSettings || '{"obsAddress": "", "obsPassword": ""}');
  });
  let obsConnection = useOBS(appSettings.obsAddress, appSettings.obsPassword);
  let obsStatus = obsConnection.obsStatus;
  let obs = obsConnection.obs;
  localStorage.debug = 'obs-websocket-js:*';

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [buttonToDelete, setButtonToDelete] = useState<number | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [buttonToEdit, setButtonToEdit] = useState<number | null>(null);

  const [tempObsAddress, setTempObsAddress] = useState('');
  const [tempObsPassword, setTempObsPassword] = useState('');

  const [obsScenes, setObsScenes] = useState<string[]>([]);

  const handleNewButton = async () => {
    try {
      if (newButton) {
        const updatedNewButton = await saveImage(newButton);
        setConfig(prevConfig => ({ buttons: [...prevConfig.buttons, updatedNewButton] }));
        setNewButton({ id: guid, command: '', name: '', colorStart: '#000000', colorEnd: '#000000', textColor: '#ff2600', sceneName: '', imageName: '' });
      }
    } catch (error) {
      console.error('Failed to add new button:', error);
    }
    setNewButtonDialogOpen(false);
  };

  const confirmEdit = async () => {
    try {
      if (buttonToEdit !== null && editButton !== null) {
        const updatedEditButton = await saveImage(editButton);
        const newButtons = [...config.buttons];
        newButtons[buttonToEdit] = updatedEditButton;
        setConfig({ buttons: newButtons });
      }
    } catch (error) {
      console.error('Failed to update button:', error);
    }
    setEditDialogOpen(false);
  };

  const handleEditButton = (index: number) => {
    const button = config.buttons[index];
    setEditButton({ ...button });
    setButtonToEdit(index);
    setEditDialogOpen(true);
  };

  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setButtonToDelete(index);
    setContextMenu({ mouseX: e.clientX - 2, mouseY: e.clientY - 4 });
  };

  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);

  const confirmDelete = () => {
    if (buttonToDelete !== null) {
      const newButtons = [...config.buttons];
      newButtons.splice(buttonToDelete, 1);
      setConfig({ buttons: newButtons });
    }
    setDeleteDialogOpen(false);
  };

  useEffect(() => {
    window.localStorage.setItem('config', JSON.stringify(config));
    window.localStorage.setItem('appSettings', JSON.stringify(appSettings));
  }, [config, appSettings]);

  useEffect(() => {
    window.localStorage.setItem('config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    console.log('obsStatus', obsStatus);
    if (obsStatus) {
      console.log('Getting scenes');
      getScenes();
      console.log('Got scenes');
    }
  }, [obsStatus]);

  const getScenes = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      obs.call('GetSceneList').then((data: any) => {
        console.log(data);
        const scenes = data.scenes.map((scene: any) => scene.sceneName);
        setObsScenes(scenes);
      }).catch((err: any) => {
        console.error('Failed to get scenes:', err);
      });
    } catch (error) {
      console.error('Failed to get scenes:', error);
    }
  };

  const handleSettingsSave = () => {
    setAppSettings({ obsAddress: tempObsAddress || appSettings.obsAddress, obsPassword: tempObsPassword || appSettings.obsPassword });
    setSettingsDialogOpen(false);
  };


  const handleDialogSave = () => {
    try {
      const newConfig = JSON.parse(configInput) as Config;
      setConfig(newConfig);
      setOpen(false);
    } catch (error) {
      console.error('Invalid JSON', error);
    }
  };

  const exportConfig = () => {
    const configString = JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(configString).then(() => {
      setSnackBarOpen(true);
    });
  };

  return (
    <div className="button-grid" style={{ position: 'relative' }}>
      <SnackbarComponent snackBarOpen={snackBarOpen} setSnackBarOpen={setSnackBarOpen} />
      <Menu
        keepMounted
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
      >
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
            setContextMenu(null);
          }}
        >
          Delete
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (buttonToDelete !== null) handleEditButton(buttonToDelete);
            setContextMenu(null);
          }}
        >
          Edit
        </MenuItem>
      </Menu>

      {config.buttons.map((btn, index) => (
        <CustomButton
          key={index}
          {...btn}
          onContextMenu={(e) => handleContextMenu(e, index)}
          obs={obs}
          appSettings={appSettings}
        />
      ))}

      <DeleteDialogComponent deleteDialogOpen={deleteDialogOpen} setDeleteDialogOpen={setDeleteDialogOpen} confirmDelete={confirmDelete} />

      <div className={`square-button`}>
        <Button variant="contained" style={{ background: 'grey' }} onClick={() => setNewButtonDialogOpen(true)}>
          <AddIcon />
        </Button>
      </div>
      <div className="obs-stat-container">
        <Tooltip title={`${obsStatus ? 'Connected' : 'Disconnected'}`}>
          <IconButton>
            <CloudCircleTwoTone color={`${obsStatus ? 'primary' : 'error'}`} />
          </IconButton>
        </Tooltip>
      </div>

      <div className="popover-container">
        <IconButton
          aria-haspopup="true"
          onMouseEnter={e => setPopoverAnchor(e.currentTarget)}
          style={{ position: 'absolute', top: -2, right: -2, transition: 'transform .2s', zIndex: 1000 }}
          className="spin-on-hover"
        >
          <SettingsIcon />
        </IconButton>
        <Popover
          open={Boolean(popoverAnchor)}
          anchorEl={popoverAnchor}
          onClose={() => setPopoverAnchor(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          style={{ position: 'absolute', zIndex: 1001 }}
        >
          <List>
            <ListItem button onClick={() => { setConfigInput(JSON.stringify(config, null, 2)); setOpen(true); }}>Import</ListItem>
            <ListItem button onClick={exportConfig}>Export</ListItem>
            <ListItem button onClick={() => setSettingsDialogOpen(true)}>Settings</ListItem>
            <ListItem button onClick={() => setScenesDialogOpen(true)}>Scenes</ListItem>

            <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)}>
              <DialogTitle style={{
                paddingBottom: "20px",
              }}>App Settings</DialogTitle>
              <DialogContent>
                <TextField
                  style={{ paddingBottom: "20px", marginTop: "23px", }}
                  label="OBS Address"
                  fullWidth
                  value={tempObsAddress || appSettings.obsAddress}
                  onChange={e => setTempObsAddress(e.target.value)}
                />
                <TextField
                  style={{ paddingBottom: "20px" }}
                  label="OBS Password"
                  type="password"
                  fullWidth
                  value={tempObsPassword || appSettings.obsPassword}
                  onChange={e => setTempObsPassword(e.target.value)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSettingsSave}>Save</Button>
              </DialogActions>
            </Dialog>
            <Dialog open={scenesDialogOpen} onClose={() => setScenesDialogOpen(false)}>
              <DialogTitle style={{
                paddingBottom: "20px",
              }}>Scenes</DialogTitle>
              <DialogContent>
                <List>
                  {obsScenes.map(scene => {
                    return (
                      <ListItem key={scene}>
                        <ListItemIcon>
                          <MovieIcon />
                        </ListItemIcon>
                        <ListItemText primary={scene} />
                      </ListItem>
                    )
                  })}
                </List>
              </DialogContent>
            </Dialog>
          </List>
        </Popover>
      </div>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Button</DialogTitle>
        <DialogContent>
          <TextField style={{
            paddingBottom: "20px",
            marginTop: "23px",
          }} label="Name" value={editButton?.name} fullWidth onChange={e => editButton && setEditButton({ ...editButton, name: e.target.value })} />
          <TextField style={{
            paddingBottom: "20px",
          }} label="Command" value={editButton?.command} fullWidth onChange={e => editButton && setEditButton({ ...editButton, command: e.target.value })} />
          <TextField
            style={{ paddingBottom: "20px" }}
            label="Start Color"
            value={editButton?.colorStart}
            fullWidth
            onChange={e => editButton && setEditButton({ ...editButton, colorStart: e.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <input type="color" value={editButton?.colorStart} onChange={e => editButton && setEditButton({ ...editButton, colorStart: e.target.value })} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            style={{ paddingBottom: "20px" }}
            label="End Color"
            value={editButton?.colorEnd}
            fullWidth
            onChange={e => editButton && setEditButton({ ...editButton, colorEnd: e.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <input type="color" value={editButton?.colorEnd} onChange={e => editButton && setEditButton({ ...editButton, colorEnd: e.target.value })} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            style={{ paddingBottom: "20px" }}
            label="Text Color"
            value={editButton?.textColor}
            fullWidth
            onChange={e => editButton && setEditButton({ ...editButton, textColor: e.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <input type="color" value={editButton?.textColor} onChange={e => editButton && setEditButton({ ...editButton, textColor: e.target.value })} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            style={{ paddingBottom: "20px" }}
            label="Image"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <input
                    type="file"
                    onChange={e => {
                      const file = (e.target as HTMLInputElement).files![0];
                      editButton && setEditButton({ ...editButton, image: file });
                    }}
                  />
                </InputAdornment>
              ),
            }}
          />
          <FormControl variant="filled" sx={{ width: "100%" }}>
            <InputLabel id="demo-simple-select-filled-label">Scene Name</InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              style={{
                width: "100%",
              }}
              label="Scene Name"
              value={editButton?.sceneName}
              onChange={e => editButton && setEditButton({ ...editButton, sceneName: e.target.value })}
            >
              {obsScenes.map(scene => {
                return (
                  <MenuItem key={scene} value={scene}>{scene}</MenuItem>
                )
              })}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmEdit}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={newButtonDialogOpen} onClose={() => setNewButtonDialogOpen(false)}>
        <DialogTitle style={{
          paddingBottom: "20px",
        }}>New Button</DialogTitle>
        <DialogContent>
          <TextField style={{
            paddingBottom: "20px",
            marginTop: "23px",
          }} label="Name" fullWidth onChange={e => setNewButton({ ...newButton, name: e.target.value })} />
          <TextField style={{
            paddingBottom: "20px",
          }} label="Command" fullWidth onChange={e => setNewButton({ ...newButton, command: e.target.value })} />
          <TextField
            style={{ paddingBottom: "20px" }}
            label="Start Color"
            fullWidth
            onChange={e => setNewButton({ ...newButton, colorStart: e.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <input type="color" value={newButton.colorStart} onChange={e => setNewButton({ ...newButton, colorStart: e.target.value })} />
                </InputAdornment>
              ),
            }}
            value={newButton.colorStart}
          />
          <TextField
            style={{ paddingBottom: "20px" }}
            label="End Color"
            fullWidth
            onChange={e => setNewButton({ ...newButton, colorEnd: e.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <input type="color" value={newButton.colorEnd} onChange={e => setNewButton({ ...newButton, colorEnd: e.target.value })} />
                </InputAdornment>
              ),
            }}
            value={newButton.colorEnd}
          />
          <TextField
            style={{ paddingBottom: "20px" }}
            label="Text Color"
            fullWidth
            onChange={e => setNewButton({ ...newButton, textColor: e.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <input type="color" value={newButton.textColor} onChange={e => setNewButton({ ...newButton, textColor: e.target.value })} />
                </InputAdornment>
              ),
            }}
            value={newButton.textColor}
          />
          <TextField
            style={{ paddingBottom: "20px" }}
            label="Image"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <input
                    type="file"
                    onChange={e => {
                      const file = (e.target as HTMLInputElement).files![0];
                      editButton && setNewButton({ ...newButton, image: file });
                    }}
                  />
                </InputAdornment>
              ),
            }}
          />
          <TextField style={{
            paddingBottom: "20px",
          }} label="Scene Name" fullWidth onChange={e => setNewButton({ ...newButton, sceneName: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewButtonDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleNewButton}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Configuration</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={10}
            variant="outlined"
            value={configInput}
            onChange={e => setConfigInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleDialogSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default App;
