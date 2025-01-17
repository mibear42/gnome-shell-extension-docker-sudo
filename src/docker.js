/*
 * Gnome3 Docker Menu Extension
 * Copyright (C) 2017 Guillaume Pouilloux <gui.pouilloux@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

var dockerCommandsToLabels = {
    start: 'Start',
    stop: 'Stop',
    pause: 'Pause',
    unpause: 'Unpause',
    rm: 'Remove'
};

/**
 * Check if docker is installed
 * @return {Boolean} whether docker is installed or not
 */
var isDockerInstalled = () => !!GLib.find_program_in_path('docker');

/**
 * Check if docker daemon is running
 * @return {Boolean} whether docker daemon is running or not
 */
var isDockerRunning = () => {
    const [res, pid, in_fd, out_fd, err_fd] = GLib.spawn_async_with_pipes(null, ['/bin/ps', 'cax'], null, 0, null);

    const outReader = new Gio.DataInputStream({
        base_stream: new Gio.UnixInputStream({ fd: out_fd })
    });

    let dockerRunning = false;
    let hasLine = true;
    do {
        const [out, size] = outReader.read_line(null);
        if (out && out.toString().indexOf("docker") > -1) {
            dockerRunning = true;
        } else if (size <= 0) {
            hasLine = false;
        }

    } while (!dockerRunning && hasLine);

    return dockerRunning;
};

/**
 * Get an array of containers
 * @return {Array} The array of containers as { name, status }
 */
var getContainers = () => {
    let cmdDocker = "docker ";
    let [res, out, err, status] = GLib.spawn_command_line_sync("sh -c \"sudo -l| grep -e 'NOPASSWD:.*docker\\(\\*\\| ps\\)'\"");
    if (status == 0) {
        cmdDocker = "sudo docker ";
    }

    [res, out, err, status] = GLib.spawn_command_line_sync(cmdDocker + "ps -a --format '{{.Names}},{{.Status}}'");
    if (status !== 0)
        throw new Error("Error occurred when fetching containers (docker.js): "+status);

    return String.fromCharCode.apply(String, out).trim().split('\n')
        .filter((string) => string.length > 0)
        .map((string) => {
            const values = string.split(',');
            return {
                name: values[0],
                status: values[1]
            };
        });
};

/**
 * Run a docker command
 * @param {String} command The command to run
 * @param {String} containerName The container
 * @param {Function} callback A callback that takes the status, command, and stdErr
 */
var runCommand = (command, containerName, callback) => {
    let cmdDocker = "docker ";
<<<<<<< HEAD
    let [res, out, err, status] = GLib.spawn_command_line_sync("sh -c \"sudo -l| grep -e 'NOPASSWD:.*docker\\(\\*\\| " + command + "\\)'\"");
=======
    let [res, out, err, status] = GLib.spawn_command_line_sync("sudo -l| grep -e 'NOPASSWD:.*docker\\(\\*\\| " + command + "\\)'");
>>>>>>> f46e574f62a9794080bfa1b928a1a456c662d0cf
    if (status == 0) {
        cmdDocker = "sudo docker ";
    }

    const cmd = cmdDocker + command + " " + containerName;
    async(() => {
        res = GLib.spawn_command_line_async(cmd);
        return res;
    }, (res) => callback(res));
}

/**
 * Run a function in asynchronous mode using GLib
 * @param {Function} fn The function to run
 * @param {Function} callback The callback to call after fn
 */
const async = (fn, callback) => GLib.timeout_add(GLib.PRIORITY_DEFAULT, 0, () => callback(fn()));
