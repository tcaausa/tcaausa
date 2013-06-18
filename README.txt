TCAA USA Website Buildout
=========================

Following are brief instructions to get up and running with this
buildout.

Setting Up the Buildout
-----------------------

Check the buildout out from source control::

  $ svn co https://svn.isotoma.com/svn/tcaausa/tcaa/trunk tcaa-buildout

Choose which buildout you want to run by soft-linking the appropriate
configuration file, development.cfg or production.cfg, as buildout.cfg::

  $ cd tcaa-buildout
  $ ln -s development.cfg buildout.cfg

Bootstrap the buildout.  This should only need to be when the
buildout is first setup or when it is moved::

  $ python2.6 bootstrap.py

Finally, simply run the buildout::

  $ bin/buildout

Running the development buildout will update packages from version
control.  This may require manual input of a username and password for
Isotoma's Subversion service.

Setting up Production for AWS Deployment
----------------------------------------

Because there are add-on packages in this buildout that are not released, it
is important to pull the correct tags of those packages for AWS deployment.  
This can be accomlished using mr.developer.  However, the production release 
should not use mr.developer as that would make production deployment dependent 
on the availability of the svn repository that is home to those packages.

To solve this problem, this buildout provides a `predeployment.cfg` file. When
preparing for an AWS deployment, edit the `[sources]` block in this file to
point to the correct tags of each package. Then run the buildout first using
this configuration. The mr.developer extension will check the package sources
out from subversion and place them in the `src` directory. After this is
complete, re-run buildout using the `production.cfg` configuration. This will
use the checked-out sources in src as develop packages, and disconnect
mr.developer so that the buildout can be run in fully offline mode for a
production release.

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