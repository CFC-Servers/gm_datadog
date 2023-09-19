# gm_datadog
Datadog Container and config for Garry's Mod servers - send your server logs to Datadog!

## Forwarding Logs to datadog

This is all kind of hacked together, so this documentation will be of the same quality. I'll do my best to describe everything I know, but it's up to you to interpret it and figure out how to use it.

I'd be happy to help you in the Issues panel, but this README will not be thorough or copy-pasteable.

We use LGSM to run some of our GMod servers. I'll describe how I set this up with LGSM, and you'll have to translate it to your setup (or open an Issue and work with me to set it up so I can document that too)

### LGSM
LGSM creates tmux panels for all of your servers.

Tmux has a `pipe-pane` option that lets you define where the raw logs from the pane get sent.
By default, lgsm `tee`'s them to your console log file.

We need to kinda hack it to also send the log lines to our datadog agent.

First, make sure you have `ncat`. I'm using:
```bash
$ ncat --version
Ncat: Version 7.60 ( https://nmap.org/ncat )
```

High-level, here's what we need to do, described in code because I'm a turbonerd:
```bash
# The name of your server's tmux panel - check `tmux ls`, it'll look like:
# cfc3: 1 windows (created Fri Dec  2 15:10:45 2022) (attached)
PANEL_NAME="cfc3"

# The rolling console log for your panel
# Unless you changed it, it'd be defined in `lgsm/config-lgsm/gmodserver/_default.cfg` as:
# consolelog="${consolelogdir}/${selfname}-console.log"
CONSOLE_LOG_PATH="/path/to/the/cfc3-console.log"

# The port that the datadog agent is expecting your log files on
# In this repo, it's the `port: 56543` line in `gmod.d/cfc3.yaml`
DD_PORT=56543

# Finally, the pipe-pane command:
tmux pipe-pane -t "$PANEL_NAME" "tee -a '$CONSOLE_LOG_PATH' | ncat -4u -w1 127.0.0.1 $DD_PORT"
```

I edited our `lgsm/functions/command_start.sh` file to do this automatically, but this is a **bad** solution and I should feel bad for doing it.
(Indeed, when we update LGSM I guarantee you I _will_ feel bad)

So, be smarter than me, but this is roughly what I changed, around line `111` _(at the time of writing)_ in `lgsm/functions/command_start.sh`:
```diff
 # Console logging enable or not set.
 elif [ "${consolelogging}" == "on" ]||[ -z "${consolelogging}" ]; then
-   tmux pipe-pane -o -t "${sessionname}" "exec cat >> '${consolelog}'"
+   tmux pipe-pane -o -t "${sessionname}" "tee -a '${consolelog}' | ncat -4u -w1 127.0.0.1 56543"
 fi
```

When I restart the datadog container after making changes, it seems like the logging breaks, so I manually re-run the `pipe-pane` command from before.

Also, if your config is broken or your regex is too aggressive, logs simply won't stream to your agent and the only way to know is watching the datadog interface.

### Adding a new server
1. Determine a new port. Current port mappings:

| **Server** | **Port** |
|------------|----------|
| CFC3       | 56543    |
| CFCTTT     | 56544    |

2. Make a new file in `gmod.d/` called `<name of your server>.yaml`.
3. Fill it with the following:
```yaml
logs:
  - type: udp
    port: <the next port>
    service: <your server name>
    source: gmod
    log_processing_rules:
      - type: exclude_at_match
        name: PascalCaseRuleName
        pattern: >-
          ^Regex pattern matching a line you want to exclude$
```
 - You can add as many rules in the `log_processing_rules` as you'd like.
4. Add a new `expose` line in the `datadog` service in the `docker-compose.wisp.yaml` file
5. Copy the `wisp-puller-cfc3` service section in `docker-compose.wisp.yaml`
 - 1. Change the `UUID` environment variable of your new service to the UUID of your panel
 - 2. Change the `DD_PORT` environment variable to your selected port from a previous step
6. Update this README to include your new port mapping in the port map table
