/*globals define*/

/*
se encarga de la comunición con meta
config: puede sobreescribir application, endpoint, template
*/

define( [
    'jquery', 'lodash', 'src/utils/string'
  ], function(
    $, _, string
  ) {

'use strict';

var meta = {
  mock: false,

  permissions: undefined,

  config: {}
};

// valores por defecto para application, endpoint y template
meta.config.application = 'comprasgestion';
meta.config.endpoint = 'http://nikita2/ws-ssc/rest.asp?';
meta.config.template = '$endpoint_Servicio=meta&' +
  '_Formato=json&_Accion=Consulta&_Recurso=PermisoUsuario&' +
  'AplicacionCodigo=$application&' +
  'UsuarioCodigo=$user&' +
  '_PaginaLong=1000&' +
  '_Campos=RecursoCodigo,AccionCodigo&callback=?';   // jsonp

meta.loadPermissions = function(config, userName, callback, profile) {

  // overwrite configuration with config from outside
  config = config || {};

  meta.user = userName;
  if (!meta.user) throw new Error('user not specified');

  meta.profile = profile;

  meta.config.application = config.application || meta.config.application;
  meta.config.endpoint = config.permissionsEndpoint || meta.config.endpoint;
  meta.config.template = config.template || meta.config.template;

  meta.mock = config.mock || meta.mock;

  meta.fetchPermissions(callback);
};

meta.fetchPermissions = function(callback) {

  if (meta.mock) {
    meta.mockFetchPermissions(callback);
    // meta.permissions = meta.mockPermissions();
    // callback(meta.permissions);
    return;
  }

  if (meta.permissions) {
    callback(meta.permissions);
  } else {
    var endpointUrl = meta.url();
    $.getJSON(endpointUrl, '', function(data) {
      meta.permissions = meta.reducePermissions(data.Response.Rows);
      callback(meta.permissions);
    });
  }
};

meta.mockFetchPermissions = function(callback) {

  // agrego los permisos comunes a todos
  var permissions = _.clone(meta.mockPermissions);

  var mockRolesPermission = {
    'admin-me': [ 'IngresoComprobantes',
      'BandejaInternetME', 'BandejaInteriorME', 'BandejaME',
      'ComprobantesME', 'NotificacionME', 'ControlME', 'Conceptos'
    ],
    'ope-me': [ 'IngresoComprobantes',
      'ComprobantesME', 'NotificacionME', 'Conceptos'
    ],
    'admin-me-int': [ 'IngresoComprobantes',
      'BandejaME',
      'ComprobantesME', 'NotificacionME', 'ControlME', 'Conceptos'
    ],
    'ope-me-int': [ 'IngresoComprobantes',
      'ComprobantesME', 'NotificacionME', 'Conceptos'
    ],
    'admin-ui': [ 'DeduccionesRetenciones',
      'BandejaUI', 'ControlAFIPUI',
      'DeduccionesRetencionesUI', 'CartaDocumentoUI', 'ControlUI',
      'TipoComprobante', 'Deducciones', 'TipoRetencion'
    ],
    'ope-ui': [ 'DeduccionesRetenciones',
      'ControlAFIPUI',
      'DeduccionesRetencionesUI', 'CartaDocumentoUI',
      'TipoComprobante', 'Deducciones', 'TipoRetencion'
    ],
    'admin-pp': [ 'Imputacion',
      'BandejaPP', 'ControlPP',
      'VerificarPresupuestoPP'
    ],
    'ope-pp': [ 'Imputacion',
      'VerificarPresupuestoPP'
    ],
    'admin-cc': [ 'AsociarDisposicion',
      'BandejaCyC', 'ControlCyC',
      'AsociarDisposicionCyC'
    ],
    'ope-cc': [ 'AsociarDisposicion',
      'AsociarDisposicionCyC'
    ],
    'admin-li': [ 'LiquidarPago',
      'BandejaLIQ', 'ControlLIQ',
      'LiquidarLIQ'
    ],
    'ope-li': [ 'LiquidarPago',
      'LiquidarLIQ'
    ],
    'admin-acp': [ 'OrdenPago',
      'BandejaAyCP', 'ControlAyCP',
      'OrdenPagoAyCP'
    ],
    'ope-acp': [ 'OrdenPago',
      'OrdenPagoAyCP'
    ],
    'admin-tes': [ 'EfectuarPago',
      'BandejaTES', 'ControlTES',
      'EfectuarPagoTES'
    ],
    'ope-tes': [ 'EfectuarPago',
      'EfectuarPagoTES'
    ],
    'direccion': [
      'BandejaME',   'ControlME',
      'BandejaUI',   'ControlUI',
      'BandejaPP',   'ControlPP',
      'BandejaCyC',  'ControlCyC',
      'BandejaLIQ',  'ControlLIQ',
      'BandejaAyCP', 'ControlAyCP',
      'BandejaTES',  'ControlTES'
    ]
  };

  // when mocking permissions
  // I have the roles of the user in the profile
  var profile = meta.profile;

  if (!profile) throw new Error('profile for user "' + meta.user + '" not specified');

  var roles = profile.Roles.toLowerCase().split(', ');
  _.each(roles, function(rol) {
    var resources = mockRolesPermission[rol];
    _.each(resources, function(resource) {
      permissions[resource.toLowerCase()] = ['alta', 'baja', 'modificacion', 'consulta'];
    });
  });

  callback(permissions);

};

meta.mockPermissions = {

  'acceso offline': ['consulta'],
  'wine': ['alta', 'baja', 'modificacion', 'consulta'],
  'country': ['alta', 'baja', 'modificacion', 'consulta'],
  'review': ['alta', 'baja', 'modificacion', 'consulta'],

  'accion': ['alta', 'baja', 'modificacion', 'consulta'],
  'proveedor': ['alta', 'baja', 'modificacion', 'consulta'],
  'proveedorcertificadoafip': ['alta', 'baja', 'modificacion', 'consulta'],
  'proveedoractividadafip': ['alta', 'baja', 'modificacion', 'consulta'],
  'proveedordomicilio': ['alta', 'baja', 'modificacion', 'consulta'],
  'oficina': ['alta', 'baja', 'modificacion', 'consulta'],
  'provincia-readonly': ['consulta'],
  'situacioniva': ['alta', 'baja', 'modificacion', 'consulta'],
  'categoriasituacioniva': ['alta', 'baja', 'modificacion', 'consulta'],
  'provincia': ['alta', 'baja', 'modificacion', 'consulta'],
  'tipocomprobante': ['alta', 'baja', 'modificacion', 'consulta'],
  'estadocomprobante': ['alta', 'baja', 'modificacion', 'consulta'],
  'estadoproceso': ['alta', 'baja', 'modificacion', 'consulta'],
  'comprobante': ['alta', 'baja', 'modificacion', 'consulta'],
  'comprobanteitem': ['alta', 'baja', 'modificacion', 'consulta'],
  'comprobantevencimiento': ['alta', 'baja', 'modificacion', 'consulta'],
  'comprobanteevento': ['alta', 'baja', 'modificacion', 'consulta'],
  'tiporetencion': ['alta', 'baja', 'modificacion', 'consulta'],
  'zona': ['alta', 'baja', 'modificacion', 'consulta'],
  'localidad': ['alta', 'baja', 'modificacion', 'consulta'],
  'menu': ['alta', 'baja', 'modificacion', 'consulta'],
  'tipoactividadafip': ['alta', 'baja', 'modificacion', 'consulta'],
  'actividadafip': ['alta', 'baja', 'modificacion', 'consulta'],
  'tipoasociacion': ['alta', 'baja', 'modificacion', 'consulta'],
  'tipoadjudicacion': ['alta', 'baja', 'modificacion', 'consulta'],
  'tipoordencompra': ['alta', 'baja', 'modificacion', 'consulta'],
  'tipoprocedimiento': ['alta', 'baja', 'modificacion', 'consulta'],
  'tiponotificacion': ['alta', 'baja', 'modificacion', 'consulta'],
  'tipoarchivo': ['alta', 'baja', 'modificacion', 'consulta'],
  'tipoformato': ['alta', 'baja', 'modificacion', 'consulta'],
  'origencomprobante': ['alta', 'baja', 'modificacion', 'consulta'],
  'contador': ['alta', 'baja', 'modificacion', 'consulta'],
  'tipopersona': ['alta', 'baja', 'modificacion', 'consulta'],
  'tipodomicilio': ['alta', 'baja', 'modificacion', 'consulta'],
  'usuario': ['alta', 'baja', 'modificacion', 'consulta']
};

meta.url = function() {
  var u = meta.config.template;

  u = string.replaceAll(u, '\\$endpoint', meta.config.endpoint);
  u = string.replaceAll(u, '\\$application', meta.config.application);
  u = string.replaceAll(u, '\\$user', meta.user);

  return u;
};

// translates from:
// {
//   Response: { Status: "ok", AtEof: "0",
//   Rows: [
//     { RecursoCodigo: "Acceso offline", AccionCodigo: "CONSULTA" },
//     { RecursoCodigo: "Accion", AccionCodigo: "ALTA" },
//   ]
//   [...]
//   }
// }
// to
// {
//   "acceso offline": ["consulta"],
//   "accion": ["alta", "baja", "modificacion", "consulta"],
//   ...
// }
meta.reducePermissions = function(permissions) {
  // var grouped, actions, reduced, resource;
  var grouped, actions, reduced;

  // first group by RecursoCodigo
  grouped = _.groupBy(permissions, function(p) { return p.RecursoCodigo; });
  reduced = {};
  // for (resource in grouped) {
  _.each(grouped, function(value, resource) {
    if (grouped.hasOwnProperty(resource)) {
      actions = _.reduce(grouped[resource], function(memo, permission) {
        memo.push(permission.AccionCodigo.toLowerCase());
        return memo;
      }, []);
      reduced[resource.toLowerCase()] = actions;
    }
  });
  // }

  return reduced;
};

  return meta;
});
