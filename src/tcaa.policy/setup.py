from setuptools import setup, find_packages
import os

version = '1.0.0'

setup(name='tcaa.policy',
      version=version,
      description="",
      long_description=open("README.txt").read() + "\n" +
                       open(os.path.join("docs", "HISTORY.txt")).read(),
      # Get more strings from
      # http://pypi.python.org/pypi?:action=list_classifiers
      classifiers=[
        "Framework :: Plone",
        "Programming Language :: Python",
        ],
      keywords='',
      author='Pat Smith',
      author_email='pat@isotoma.com',
      url='http://dist.isotoma.com',
      license='GPL',
      packages=find_packages(exclude=['ez_setup']),
      namespace_packages=['tcaa'],
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          'setuptools',
          'Plone',    
          'tcaa.theme',
          'tcaa.content',
      ],
      extras_require={
          'test': ['plone.app.testing',]
      },
      entry_points="""
      # -*- Entry points: -*-

      [z3c.autoinclude.plugin]
      target = plone
      """,
      )
