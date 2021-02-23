module.exports = [
  {
    redirect: "cloud",
    name: "Home Assistant Cloud",
    description: "show your Home Assistant Cloud configuration",
    introduced: "2021.3",
    component: "cloud",
  },
  {
    redirect: "integrations",
    name: "Integrations: Dashboard",
    description: "show your integrations",
    introduced: "2021.3",
  },
  {
    redirect: "config_flow_start",
    name: "Integrations: Start a config flow",
    description: "start setting up a new integration",
    introduced: "2021.3",
    params: {
      domain: "string",
    },
    example: {
      domain: "hue",
    },
  },
  {
    redirect: "devices",
    name: "Devices",
    description: "show your devices",
    introduced: "2021.3",
  },
  {
    redirect: "entities",
    name: "Entities",
    description: "show your entities",
    introduced: "2021.3",
  },
  {
    redirect: "areas",
    name: "Areas",
    description: "show your areas",
    introduced: "2021.3",
  },
  {
    redirect: "blueprints",
    name: "Blueprints: Dashboard",
    description: "show your blueprints",
    introduced: "2021.3",
  },
  {
    redirect: "blueprint_import",
    name: "Blueprints: Start import",
    description: "allow importing a blueprint",
    introduced: "2021.3",
    params: {
      blueprint_url: "url",
    },
    example: {
      blueprint_url:
        "https://github.com/home-assistant/core/blob/dev/homeassistant/components/automation/blueprints/motion_light.yaml",
    },
  },
  {
    redirect: "automations",
    name: "Automations",
    description: "show your automations",
    introduced: "2021.3",
  },
  {
    redirect: "scenes",
    name: "Scenes",
    description: "show your scenes",
    introduced: "2021.3",
  },
  {
    redirect: "scripts",
    name: "Scripts",
    description: "show your scripts",
    introduced: "2021.3",
  },
  {
    redirect: "helpers",
    name: "Helpers",
    description: "show your helper entities",
    introduced: "2021.3",
  },
  {
    redirect: "tags",
    name: "Tags",
    description: "show your tags",
    introduced: "2021.3",
  },
  {
    redirect: "lovelace_dashboards",
    name: "Lovelace: Dashboards",
    description: "show your Lovelace dashboards",
    introduced: "2021.3",
  },
  {
    redirect: "lovelace_resources",
    name: "Lovelace: Resources",
    description: "show your Lovelace resources",
    introduced: "2021.3",
  },
  {
    redirect: "people",
    name: "People",
    description: "show your people",
    introduced: "2021.3",
  },
  {
    redirect: "zones",
    name: "Zones",
    description: "show your zones",
    introduced: "2021.3",
  },
  {
    redirect: "users",
    name: "Users",
    description: "show your users",
    introduced: "2021.3",
  },
  {
    redirect: "general",
    name: "General Settings",
    description: "show your general Home Assistant settings",
    introduced: "2021.3",
  },
  {
    redirect: "server_controls",
    name: "Server Controls",
    description: "show your server controls",
    introduced: "2021.3",
  },
  {
    redirect: "info",
    name: "Info",
    description: "show your Home Assistant version information",
    introduced: "2021.3",
  },
  {
    redirect: "logs",
    name: "Logs",
    description: "show your Home Assistant logs",
    introduced: "2021.3",
  },
  {
    redirect: "profile",
    name: "User profile",
    description: "show your Home Assistant user's profile",
    introduced: "2021.3",
  },
  {
    redirect: "developer_states",
    name: "Developer Tools: States",
    description: "show your state developer tools",
    introduced: "2021.3",
  },
  {
    redirect: "developer_services",
    name: "Developer Tools: Services",
    description: "show your service developer tools",
    introduced: "2021.3",
  },
  {
    redirect: "developer_template",
    name: "Developer Tools: Templates",
    description: "show your template developer tools",
    introduced: "2021.3",
  },
  {
    redirect: "developer_events",
    name: "Developer Tools: Events",
    description: "show your event developer tools",
    introduced: "2021.3",
  },
  {
    redirect: "developer_mqtt",
    name: "Developer Tools: MQTT",
    description: "show your MQTT developer tools",
    introduced: "2021.3",
  },
  {
    redirect: "supervisor",
    name: "Supervisor: Dashboard",
    description: "show your Supervisor dashboard",
    introduced: "supervisor-2021.02.10",
  },
  {
    redirect: "supervisor_info",
    name: "Supervisor: Info",
    description: "show your Supervisor system information",
    introduced: "supervisor-2021.02.12",
  },
  {
    redirect: "supervisor_logs",
    name: "Supervisor: Logs",
    description: "show your Supervisor system logs",
    introduced: "supervisor-2021.02.12",
  },
  {
    redirect: "supervisor_snapshots",
    name: "Supervisor: Snapshots",
    description: "show your Supervisor snapshots",
    introduced: "supervisor-2021.02.10",
  },
  {
    redirect: "supervisor_addon",
    name: "Supervisor: Show add-on",
    description: "show the dashboard of a Supervisor add-on",
    introduced: "supervisor-2021.02.10",
    params: {
      addon: "string",
    },
    example: {
      addon: "core_samba",
    },
  },
];

module.exports.sort((a, b) => {
  const aName = a.name.toLowerCase();
  const bName = b.name.toLowerCase();

  if (aName < bName) {
    return -1;
  }
  if (aName > bName) {
    return 1;
  }

  return 0;
});
