TCAA USA Website Buildout
=========================

Following are brief instructions to get up and running with this
buildout.

Setting Up the Buildout
-----------------------

Check the buildout out from source control::

  $ svn co https://svn.isotoma.com/svn/tcaausa/tcaa/trunk tcaa-buildout

Choose which buildout you want to run by uncommenting the appropriate line in
buildout.cfg::

  $ cd tcaa-buildout
  $ vi buildout.cfg
  [buildout]
  extends =
  #     production.cfg
      development.cfg

Bootstrap the buildout.  This should only need to be when the
buildout is first setup or when it is moved::

  $ python2.6 bootstrap.py

Finally, simply run the buildout::

  $ bin/buildout

Running the development buildout will update packages from version
control.  This may require manual input of a username and password for
Isotoma's Subversion service.

Process control
---------------

All services are controlled using the supervisord_ process manager.
Supervisord takes care of starting all daemons, restarting them when needed,
and can optionally provide a web interface allowing for easy remote
management.

To start supervisord start its daemon ``bin/supervisord``. This will
automatically start the ZEO server, and ZEO Clients. You start, stop and
restart those via the ``bin/supervisorctl`` utility.

To start all processes automatically on system boot it is necessary to start
supervisord as part of the system boot process. This can easily be done by
adding a crontab entry to the account used for your site::

  # Automatically start the Plone deployment
  @reboot /web1/ump.site/bin/supervisord -c /web1/ump.site/etc/supervisord.conf

.. _supervisord: http://www.supervisord.org/